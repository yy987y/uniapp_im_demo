"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_nimSdk = require("../../utils/nim-sdk.js");
const LogPanel = () => "../../components/LogPanel.js";
const _sfc_main = {
  components: { LogPanel },
  data() {
    return {
      logs: [],
      // SDK 初始化配置 - 默认 AppKey (小程序端)
      initConfig: {
        appkey: "4727023efa991d31d61b3b32e819bd5b",
        debugLevel: "debug"
      },
      debugLevelOptions: [
        { label: "关闭 (off)", value: "off" },
        { label: "调试 (debug)", value: "debug" },
        { label: "日志 (log)", value: "log" }
      ],
      selectedDebugLevelIndex: 1,
      // IM 登录配置 - 默认账号
      loginConfig: {
        accountId: "yanchaodemo",
        token: "111111"
      },
      // 聊天室配置 - 默认聊天室ID
      chatroomConfig: {
        roomId: "14037995981"
      },
      // 状态
      imLoginStatus: null,
      chatroomStatus: null
    };
  },
  computed: {
    selectedDebugLevel() {
      var _a;
      return ((_a = this.debugLevelOptions[this.selectedDebugLevelIndex]) == null ? void 0 : _a.label) || "调试 (debug)";
    },
    imLoginStatusText() {
      const status = this.imLoginStatus;
      switch (status) {
        case 0:
          return "未登录";
        case 1:
          return "已登录";
        case 2:
          return "登录中";
        case 3:
          return "退避中";
        default:
          return "未知";
      }
    },
    chatroomStatusText() {
      switch (this.chatroomStatus) {
        case "entered":
          return "已进入";
        case "entering":
          return "进入中";
        case "exited":
          return "已退出";
        default:
          return "未进入";
      }
    }
  },
  onLoad() {
    const saved = common_vendor.index.getStorageSync("nim_init_config");
    if (saved) {
      this.initConfig = { ...this.initConfig, ...saved };
    }
    utils_nimSdk.nimSdk.setLogCallback((log) => {
      this.logs.push(log);
      if (this.logs.length > 200)
        this.logs.shift();
    });
    this.refreshStatus();
  },
  onShow() {
    this.refreshStatus();
  },
  methods: {
    clearLogs() {
      this.logs = [];
    },
    refreshStatus() {
      this.imLoginStatus = utils_nimSdk.nimSdk.getLoginStatus();
      this.chatroomStatus = utils_nimSdk.nimSdk.isChatroomInitialized() ? "entered" : null;
    },
    onDebugLevelChange(e) {
      this.selectedDebugLevelIndex = e.detail.value;
      this.initConfig.debugLevel = this.debugLevelOptions[e.detail.value].value;
    },
    // 初始化 SDK
    handleInitSDK() {
      if (!this.initConfig.appkey) {
        common_vendor.index.showToast({ title: "请输入AppKey", icon: "none" });
        return;
      }
      try {
        utils_nimSdk.nimSdk.initNIM({
          appkey: this.initConfig.appkey,
          debugLevel: this.initConfig.debugLevel
        });
        common_vendor.index.setStorageSync("nim_init_config", this.initConfig);
        common_vendor.index.showToast({ title: "初始化成功", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: "失败: " + e.message, icon: "none" });
      }
    },
    // IM 登录
    async handleLogin() {
      if (!utils_nimSdk.nimSdk.isInitialized()) {
        common_vendor.index.showToast({ title: "请先初始化SDK", icon: "none" });
        return;
      }
      if (!this.loginConfig.accountId || !this.loginConfig.token) {
        common_vendor.index.showToast({ title: "请输入账号和Token", icon: "none" });
        return;
      }
      try {
        await utils_nimSdk.nimSdk.login(this.loginConfig.accountId, this.loginConfig.token);
        this.imLoginStatus = 1;
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: "登录失败: " + e.message, icon: "none" });
      }
    },
    // IM 登出
    async handleLogout() {
      try {
        await utils_nimSdk.nimSdk.logout();
        this.imLoginStatus = 0;
        common_vendor.index.showToast({ title: "登出成功", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: "登出失败: " + e.message, icon: "none" });
      }
    },
    // 进入聊天室 (独立于 IM 登录)
    async handleEnterChatroom() {
      var _a, _b;
      if (!utils_nimSdk.nimSdk.isInitialized()) {
        utils_nimSdk.nimSdk.getLogger().info("SDK未初始化，自动初始化...");
        try {
          utils_nimSdk.nimSdk.initNIM({
            appkey: this.initConfig.appkey,
            debugLevel: this.initConfig.debugLevel
          });
        } catch (e) {
          common_vendor.index.showToast({ title: "初始化SDK失败", icon: "none" });
          return;
        }
      }
      if (!this.chatroomConfig.roomId) {
        common_vendor.index.showToast({ title: "请输入聊天室ID", icon: "none" });
        return;
      }
      try {
        this.chatroomStatus = "entering";
        const roomId = this.chatroomConfig.roomId;
        const accountId = utils_nimSdk.nimSdk.getLoginUser() || this.loginConfig.accountId;
        const token = this.loginConfig.token;
        const isIMLoggedIn = utils_nimSdk.nimSdk.getLoginStatus() === 1;
        if (!roomId) {
          throw new Error("聊天室ID不能为空");
        }
        if (!accountId) {
          throw new Error("账号ID不能为空");
        }
        if (!token) {
          throw new Error("Token不能为空");
        }
        utils_nimSdk.nimSdk.getLogger().info("步骤1: 初始化聊天室实例...");
        utils_nimSdk.nimSdk.initChatroom({
          appkey: this.initConfig.appkey,
          debugLevel: this.initConfig.debugLevel
        });
        utils_nimSdk.nimSdk.getLogger().info("步骤2: 准备进入聊天室", {
          roomId,
          accountId,
          token: token ? `${token.substring(0, 2)}***` : "null",
          isIMLoggedIn,
          linkStrategy: isIMLoggedIn ? "动态获取 (getChatroomLinkAddress)" : "固定地址 (wlnimsc1.netease.im:443)"
        });
        const linkProvider = async (sdkParam1, sdkParam2) => {
          utils_nimSdk.nimSdk.getLogger().info("linkProvider 被调用", {
            sdkParam1,
            sdkParam2,
            roomIdFromClosure: roomId,
            isIMLoggedIn
          });
          if (isIMLoggedIn) {
            utils_nimSdk.nimSdk.getLogger().info("IM已登录，调用 getChatroomLinkAddress 获取动态地址...");
            try {
              const linkAddresses = await utils_nimSdk.nimSdk.getChatroomLinkAddress(roomId, true);
              utils_nimSdk.nimSdk.getLogger().success("动态获取聊天室地址成功", { linkAddresses });
              return linkAddresses;
            } catch (e) {
              utils_nimSdk.nimSdk.getLogger().warn("动态获取地址失败，降级使用固定地址", { error: e.message });
              return ["wlnimsc1.netease.im:443"];
            }
          } else {
            utils_nimSdk.nimSdk.getLogger().info("IM未登录，使用固定聊天室地址");
            return ["wlnimsc1.netease.im:443"];
          }
        };
        const enterParams = {
          accountId,
          token,
          linkProvider,
          anonymousMode: false
        };
        utils_nimSdk.nimSdk.getLogger().info("步骤3: 调用 enter 方法...", {
          roomId,
          accountId,
          hasLinkProvider: true,
          anonymousMode: false
        });
        const result = await utils_nimSdk.nimSdk.enterChatroom(roomId, enterParams);
        this.chatroomStatus = "entered";
        utils_nimSdk.nimSdk.getLogger().success("进入聊天室成功", {
          roomId: (_a = result.chatroom) == null ? void 0 : _a.roomId,
          roomName: (_b = result.chatroom) == null ? void 0 : _b.roomName
        });
        common_vendor.index.showToast({ title: "进入聊天室成功", icon: "success" });
      } catch (e) {
        this.chatroomStatus = "exited";
        utils_nimSdk.nimSdk.getLogger().error("进入聊天室失败", { code: e.code, message: e.message });
        common_vendor.index.showToast({ title: "进入聊天室失败: " + e.message, icon: "none" });
      }
    },
    // 退出聊天室
    async handleExitChatroom() {
      try {
        await utils_nimSdk.nimSdk.exitChatroom();
        await utils_nimSdk.nimSdk.destroyChatroom();
        this.chatroomStatus = "exited";
        common_vendor.index.showToast({ title: "退出聊天室成功", icon: "success" });
      } catch (e) {
        common_vendor.index.showToast({ title: "退出聊天室失败: " + e.message, icon: "none" });
      }
    },
    // 一键登录
    async handleOneClickLogin() {
      try {
        if (!utils_nimSdk.nimSdk.isInitialized()) {
          utils_nimSdk.nimSdk.getLogger().info("=== 一键登录开始 ===");
          utils_nimSdk.nimSdk.getLogger().info("步骤1: 初始化SDK...");
          utils_nimSdk.nimSdk.initNIM({
            appkey: this.initConfig.appkey,
            debugLevel: this.initConfig.debugLevel
          });
          common_vendor.index.setStorageSync("nim_init_config", this.initConfig);
        }
        if (utils_nimSdk.nimSdk.getLoginStatus() !== 1) {
          utils_nimSdk.nimSdk.getLogger().info("步骤2: 登录IM...");
          await utils_nimSdk.nimSdk.login(this.loginConfig.accountId, this.loginConfig.token);
          this.imLoginStatus = 1;
        }
        utils_nimSdk.nimSdk.getLogger().info("步骤3: 进入聊天室...");
        await this.handleEnterChatroom();
        utils_nimSdk.nimSdk.getLogger().success("=== 一键登录完成 ===");
      } catch (e) {
        utils_nimSdk.nimSdk.getLogger().error("一键登录失败", { message: e.message });
        common_vendor.index.showToast({ title: "一键登录失败: " + e.message, icon: "none" });
      }
    },
    // 一键登出
    async handleOneClickLogout() {
      try {
        utils_nimSdk.nimSdk.getLogger().info("=== 一键登出开始 ===");
        if (utils_nimSdk.nimSdk.isChatroomInitialized()) {
          utils_nimSdk.nimSdk.getLogger().info("步骤1: 退出聊天室...");
          await utils_nimSdk.nimSdk.exitChatroom();
          await utils_nimSdk.nimSdk.destroyChatroom();
          this.chatroomStatus = "exited";
        }
        if (utils_nimSdk.nimSdk.getLoginStatus() === 1) {
          utils_nimSdk.nimSdk.getLogger().info("步骤2: 登出IM...");
          await utils_nimSdk.nimSdk.logout();
          this.imLoginStatus = 0;
        }
        utils_nimSdk.nimSdk.getLogger().success("=== 一键登出完成 ===");
        common_vendor.index.showToast({ title: "一键登出成功", icon: "success" });
      } catch (e) {
        utils_nimSdk.nimSdk.getLogger().error("一键登出失败", { message: e.message });
        common_vendor.index.showToast({ title: "一键登出失败: " + e.message, icon: "none" });
      }
    },
    // 注册事件监听
    registerListeners() {
      utils_nimSdk.nimSdk.registerLoginListeners({
        onLoginStatus: (s) => utils_nimSdk.nimSdk.getLogger().info("IM登录状态变化", { status: s }),
        onKickedOffline: (d) => utils_nimSdk.nimSdk.getLogger().warn("IM被踢下线", d),
        onConnectStatus: (s) => utils_nimSdk.nimSdk.getLogger().info("IM连接状态变化", { status: s })
      });
      utils_nimSdk.nimSdk.registerChatroomListeners({
        onChatroomStatus: (s) => utils_nimSdk.nimSdk.getLogger().info("聊天室状态变化", { status: s }),
        onChatroomKicked: (d) => utils_nimSdk.nimSdk.getLogger().warn("被踢出聊天室", d)
      });
      common_vendor.index.showToast({ title: "已注册监听", icon: "success" });
    },
    // 移除事件监听
    removeListeners() {
      utils_nimSdk.nimSdk.removeLoginListeners();
      utils_nimSdk.nimSdk.removeChatroomListeners();
      common_vendor.index.showToast({ title: "已移除监听", icon: "success" });
    }
  }
};
if (!Array) {
  const _component_LogPanel = common_vendor.resolveComponent("LogPanel");
  _component_LogPanel();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.initConfig.appkey,
    b: common_vendor.o(($event) => $data.initConfig.appkey = $event.detail.value),
    c: common_vendor.t($options.selectedDebugLevel),
    d: $data.debugLevelOptions,
    e: common_vendor.o((...args) => $options.onDebugLevelChange && $options.onDebugLevelChange(...args)),
    f: common_vendor.o((...args) => $options.handleInitSDK && $options.handleInitSDK(...args)),
    g: $data.loginConfig.accountId,
    h: common_vendor.o(($event) => $data.loginConfig.accountId = $event.detail.value),
    i: $data.loginConfig.token,
    j: common_vendor.o(($event) => $data.loginConfig.token = $event.detail.value),
    k: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    l: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args)),
    m: $data.imLoginStatus !== null
  }, $data.imLoginStatus !== null ? {
    n: common_vendor.t($options.imLoginStatusText),
    o: common_vendor.n($data.imLoginStatus === 1 ? "status-online" : "status-offline")
  } : {}, {
    p: $data.chatroomConfig.roomId,
    q: common_vendor.o(($event) => $data.chatroomConfig.roomId = $event.detail.value),
    r: common_vendor.o((...args) => $options.handleEnterChatroom && $options.handleEnterChatroom(...args)),
    s: common_vendor.o((...args) => $options.handleExitChatroom && $options.handleExitChatroom(...args)),
    t: $data.chatroomStatus !== null
  }, $data.chatroomStatus !== null ? {
    v: common_vendor.t($options.chatroomStatusText),
    w: common_vendor.n($data.chatroomStatus === "entered" ? "status-online" : "status-offline")
  } : {}, {
    x: common_vendor.o((...args) => $options.handleOneClickLogin && $options.handleOneClickLogin(...args)),
    y: common_vendor.o((...args) => $options.handleOneClickLogout && $options.handleOneClickLogout(...args)),
    z: common_vendor.o((...args) => $options.registerListeners && $options.registerListeners(...args)),
    A: common_vendor.o((...args) => $options.removeListeners && $options.removeListeners(...args)),
    B: common_vendor.o($options.clearLogs),
    C: common_vendor.p({
      logs: $data.logs,
      height: "400rpx"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map

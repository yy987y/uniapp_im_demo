"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_nimSdk = require("../../utils/nim-sdk.js");
const LogPanel = () => "../../components/LogPanel.js";
const _sfc_main = {
  components: {
    LogPanel
  },
  data() {
    return {
      sdkVersion: "v10.9.x",
      logs: [],
      sdkInitialized: false,
      currentAccount: null,
      loginStatus: null
    };
  },
  computed: {
    loginStatusText() {
      const status = this.loginStatus;
      if (status === null)
        return "未初始化";
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
    loginStatusClass() {
      const status = this.loginStatus;
      if (status === 1)
        return "status-online";
      if (status === 2 || status === 3)
        return "status-connecting";
      return "status-offline";
    }
  },
  onShow() {
    this.refreshStatus();
  },
  onLoad() {
    utils_nimSdk.nimSdk.setLogCallback((log) => {
      this.logs.push(log);
      if (this.logs.length > 100) {
        this.logs.shift();
      }
    });
    this.refreshStatus();
  },
  methods: {
    refreshStatus() {
      this.sdkInitialized = utils_nimSdk.nimSdk.isInitialized();
      this.currentAccount = utils_nimSdk.nimSdk.getLoginUser();
      this.loginStatus = utils_nimSdk.nimSdk.getLoginStatus();
    },
    goToLogin() {
      common_vendor.index.navigateTo({ url: "/pages/login/login" });
    },
    async handleLogout() {
      try {
        await utils_nimSdk.nimSdk.logout();
        this.refreshStatus();
        common_vendor.index.showToast({
          title: "登出成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: "登出失败: " + error.message,
          icon: "none"
        });
      }
    },
    async handleDestroy() {
      common_vendor.index.showModal({
        title: "确认",
        content: "确定要销毁SDK实例吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await utils_nimSdk.nimSdk.destroyNIM();
              this.refreshStatus();
              common_vendor.index.showToast({
                title: "销毁成功",
                icon: "success"
              });
            } catch (error) {
              common_vendor.index.showToast({
                title: "销毁失败: " + error.message,
                icon: "none"
              });
            }
          }
        }
      });
    },
    clearLogs() {
      this.logs = [];
    }
  }
};
if (!Array) {
  const _component_LogPanel = common_vendor.resolveComponent("LogPanel");
  _component_LogPanel();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.sdkInitialized ? "已初始化" : "未初始化"),
    b: common_vendor.n($data.sdkInitialized ? "status-online" : "status-offline"),
    c: common_vendor.t($options.loginStatusText),
    d: common_vendor.n($options.loginStatusClass),
    e: $data.currentAccount
  }, $data.currentAccount ? {
    f: common_vendor.t($data.currentAccount)
  } : {}, {
    g: common_vendor.t($data.sdkVersion),
    h: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args)),
    i: $data.sdkInitialized
  }, $data.sdkInitialized ? {
    j: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  } : {}, {
    k: $data.sdkInitialized
  }, $data.sdkInitialized ? {
    l: common_vendor.o((...args) => $options.handleDestroy && $options.handleDestroy(...args))
  } : {}, {
    m: common_vendor.o($options.clearLogs),
    n: common_vendor.p({
      logs: $data.logs,
      height: "400rpx"
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map

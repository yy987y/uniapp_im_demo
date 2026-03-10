"use strict";
const common_vendor = require("../common/vendor.js");
let nimInstance = null;
let logCallback = null;
const logger = {
  setCallback(callback) {
    logCallback = callback;
  },
  log(type, message, data = null) {
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleTimeString();
    const logEntry = {
      time: timestamp,
      type,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    common_vendor.index.__f__("log", "at utils/nim-sdk.js:34", `[${timestamp}] [${type.toUpperCase()}] ${message}`, data || "");
    if (logCallback) {
      logCallback(logEntry);
    }
  },
  info(message, data) {
    this.log("info", message, data);
  },
  success(message, data) {
    this.log("success", message, data);
  },
  error(message, data) {
    this.log("error", message, data);
  },
  warn(message, data) {
    this.log("warn", message, data);
  }
};
function isMiniProgram() {
  return true;
}
function initNIM(options = {}) {
  const defaultOptions = {
    appkey: options.appkey || "4727023efa991d31d61b3b32e819bd5b",
    debugLevel: options.debugLevel || "debug",
    apiVersion: "v2"
  };
  const isMP = isMiniProgram();
  const loginServiceConfig = {
    customClientType: options.customClientType || void 0,
    customTag: options.customTag || void 0,
    isFixedDeviceId: options.isFixedDeviceId !== void 0 ? options.isFixedDeviceId : false
  };
  {
    loginServiceConfig.lbsUrls = options.lbsUrls || ["https://lbs.netease.im/lbs/wxwebconf.jsp"];
    loginServiceConfig.linkUrl = options.linkUrl || "wlnimsc0.netease.im";
    logger.info("检测到小程序环境，使用小程序专用连接配置", {
      lbsUrls: loginServiceConfig.lbsUrls,
      linkUrl: loginServiceConfig.linkUrl
    });
  }
  const otherOptions = {
    V2NIMLoginServiceConfig: loginServiceConfig
  };
  try {
    nimInstance = common_vendor.NIM.getInstance(defaultOptions, otherOptions);
    logger.success("NIM SDK 初始化成功", {
      appkey: defaultOptions.appkey,
      isMiniProgram: isMP
    });
    return nimInstance;
  } catch (error) {
    logger.error("NIM SDK 初始化失败", error);
    throw error;
  }
}
function getNIM() {
  return nimInstance;
}
async function destroyNIM() {
  if (nimInstance) {
    try {
      await nimInstance.destroy();
      nimInstance = null;
      logger.success("NIM SDK 已销毁");
    } catch (error) {
      logger.error("NIM SDK 销毁失败", error);
      throw error;
    }
  }
}
function isInitialized() {
  return nimInstance !== null;
}
function setLogCallback(callback) {
  logger.setCallback(callback);
}
function getLogger() {
  return logger;
}
async function login(accountId, token, loginOption = {}) {
  if (!nimInstance) {
    throw new Error("NIM SDK 未初始化");
  }
  try {
    logger.info("开始登录...", { accountId });
    await nimInstance.V2NIMLoginService.login(accountId, token, loginOption);
    logger.success("登录成功", { accountId });
  } catch (error) {
    logger.error("登录失败", { code: error.code, message: error.message });
    throw error;
  }
}
async function logout() {
  if (!nimInstance) {
    throw new Error("NIM SDK 未初始化");
  }
  try {
    logger.info("开始登出...");
    await nimInstance.V2NIMLoginService.logout();
    logger.success("登出成功");
  } catch (error) {
    logger.error("登出失败", error);
    throw error;
  }
}
function getLoginUser() {
  if (!nimInstance)
    return null;
  return nimInstance.V2NIMLoginService.getLoginUser();
}
function getLoginStatus() {
  if (!nimInstance)
    return null;
  return nimInstance.V2NIMLoginService.getLoginStatus();
}
function getConnectStatus() {
  if (!nimInstance)
    return null;
  return nimInstance.V2NIMLoginService.getConnectStatus();
}
function getCurrentLoginClient() {
  if (!nimInstance)
    return null;
  return nimInstance.V2NIMLoginService.getCurrentLoginClient();
}
function getLoginClients() {
  if (!nimInstance)
    return [];
  return nimInstance.V2NIMLoginService.getLoginClients();
}
async function kickOffline(client) {
  if (!nimInstance) {
    throw new Error("NIM SDK 未初始化");
  }
  try {
    logger.info("踢出其他端...", client);
    await nimInstance.V2NIMLoginService.kickOffline(client);
    logger.success("踢出成功");
  } catch (error) {
    logger.error("踢出失败", error);
    throw error;
  }
}
function getKickedOfflineDetail() {
  if (!nimInstance)
    return null;
  return nimInstance.V2NIMLoginService.getKickedOfflineDetail();
}
function getDataSync() {
  if (!nimInstance)
    return null;
  return nimInstance.V2NIMLoginService.getDataSync();
}
function registerLoginListeners(callbacks = {}) {
  if (!nimInstance)
    return;
  const service = nimInstance.V2NIMLoginService;
  if (callbacks.onLoginStatus) {
    service.on("onLoginStatus", callbacks.onLoginStatus);
  }
  if (callbacks.onLoginFailed) {
    service.on("onLoginFailed", callbacks.onLoginFailed);
  }
  if (callbacks.onKickedOffline) {
    service.on("onKickedOffline", callbacks.onKickedOffline);
  }
  if (callbacks.onLoginClientChanged) {
    service.on("onLoginClientChanged", callbacks.onLoginClientChanged);
  }
  if (callbacks.onConnectStatus) {
    service.on("onConnectStatus", callbacks.onConnectStatus);
  }
  if (callbacks.onDisconnected) {
    service.on("onDisconnected", callbacks.onDisconnected);
  }
  if (callbacks.onConnectFailed) {
    service.on("onConnectFailed", callbacks.onConnectFailed);
  }
  if (callbacks.onDataSync) {
    service.on("onDataSync", callbacks.onDataSync);
  }
  logger.info("登录服务事件监听已注册");
}
function removeLoginListeners() {
  if (!nimInstance)
    return;
  const service = nimInstance.V2NIMLoginService;
  service.removeAllListeners();
  logger.info("登录服务事件监听已移除");
}
let chatroomInstance = null;
async function getChatroomLinkAddress(roomId, isMiniApp = true) {
  if (!nimInstance) {
    throw new Error("NIM SDK 未初始化");
  }
  try {
    logger.info("获取聊天室Link地址...", { roomId, isMiniApp });
    const linkAddresses = await nimInstance.V2NIMLoginService.getChatroomLinkAddress(roomId, isMiniApp);
    logger.success("获取聊天室Link地址成功", { linkAddresses });
    return linkAddresses;
  } catch (error) {
    logger.error("获取聊天室Link地址失败", { code: error.code, message: error.message });
    throw error;
  }
}
function initChatroom(options = {}) {
  const initParams = {
    appkey: options.appkey,
    debugLevel: options.debugLevel || "debug"
  };
  try {
    chatroomInstance = common_vendor.V2NIMChatroomClient.newInstance(initParams);
    logger.success("聊天室实例初始化成功", { appkey: initParams.appkey });
    return chatroomInstance;
  } catch (error) {
    logger.error("聊天室实例初始化失败", error);
    throw error;
  }
}
function getChatroom() {
  return chatroomInstance;
}
async function enterChatroom(roomId, enterParams = {}) {
  var _a, _b;
  if (!chatroomInstance) {
    throw new Error("聊天室实例未初始化");
  }
  try {
    logger.info("进入聊天室...", { roomId, accountId: enterParams.accountId });
    const result = await chatroomInstance.enter(roomId, enterParams);
    logger.success("进入聊天室成功", { roomId: (_a = result.chatroom) == null ? void 0 : _a.roomId, roomName: (_b = result.chatroom) == null ? void 0 : _b.roomName });
    return result;
  } catch (error) {
    logger.error("进入聊天室失败", { code: error.code, message: error.message });
    throw error;
  }
}
function exitChatroom() {
  if (!chatroomInstance) {
    throw new Error("聊天室实例未初始化");
  }
  try {
    logger.info("退出聊天室...");
    chatroomInstance.exit();
    logger.success("退出聊天室成功");
  } catch (error) {
    logger.error("退出聊天室失败", error);
    throw error;
  }
}
function destroyChatroom() {
  if (chatroomInstance) {
    try {
      const instanceId = chatroomInstance.getInstanceId();
      common_vendor.V2NIMChatroomClient.destroyInstance(instanceId);
      chatroomInstance = null;
      logger.success("聊天室实例已销毁");
    } catch (error) {
      logger.error("聊天室实例销毁失败", error);
      throw error;
    }
  }
}
function isChatroomInitialized() {
  return chatroomInstance !== null;
}
function registerChatroomListeners(callbacks = {}) {
  if (!chatroomInstance)
    return;
  if (callbacks.onChatroomStatus) {
    chatroomInstance.on("onChatroomStatus", callbacks.onChatroomStatus);
  }
  if (callbacks.onChatroomEntered) {
    chatroomInstance.on("onChatroomEntered", callbacks.onChatroomEntered);
  }
  if (callbacks.onChatroomExited) {
    chatroomInstance.on("onChatroomExited", callbacks.onChatroomExited);
  }
  if (callbacks.onChatroomKicked) {
    chatroomInstance.on("onChatroomKicked", callbacks.onChatroomKicked);
  }
  logger.info("聊天室事件监听已注册");
}
function removeChatroomListeners() {
  if (!chatroomInstance)
    return;
  chatroomInstance.off("onChatroomStatus");
  chatroomInstance.off("onChatroomEntered");
  chatroomInstance.off("onChatroomExited");
  chatroomInstance.off("onChatroomKicked");
  logger.info("聊天室事件监听已移除");
}
const nimSdk = {
  initNIM,
  getNIM,
  destroyNIM,
  isInitialized,
  setLogCallback,
  getLogger,
  login,
  logout,
  getLoginUser,
  getLoginStatus,
  getConnectStatus,
  getCurrentLoginClient,
  getLoginClients,
  kickOffline,
  getKickedOfflineDetail,
  getDataSync,
  registerLoginListeners,
  removeLoginListeners,
  // 聊天室相关
  getChatroomLinkAddress,
  initChatroom,
  getChatroom,
  enterChatroom,
  exitChatroom,
  destroyChatroom,
  isChatroomInitialized,
  registerChatroomListeners,
  removeChatroomListeners
};
exports.nimSdk = nimSdk;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/nim-sdk.js.map

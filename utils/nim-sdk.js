/**
 * NIM SDK 管理器
 * 职责：实例生命周期管理 + 全局事件监听 + 自动维护 store 状态
 */
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK'
import logger from './logger.js'
import store from './store.js'

let nimInstance = null
let globalListenersRegistered = false

function isMiniProgram() {
  // #ifdef MP-WEIXIN
  return true
  // #endif
  // #ifndef MP-WEIXIN
  return false
  // #endif
}

/**
 * 初始化 NIM SDK
 * @param {Object} options
 * @param {string} options.appkey
 * @param {string} [options.debugLevel='debug']
 * @param {string[]} [options.lbsUrls]
 * @param {string} [options.linkUrl]
 * @param {number} [options.customClientType]
 * @param {string} [options.customTag]
 * @param {boolean} [options.isFixedDeviceId=false]
 * @returns {Object} NIM 实例
 */
export function initNIM(options = {}) {
  const initOptions = {
    appkey: options.appkey || '4727023efa991d31d61b3b32e819bd5b',
    debugLevel: options.debugLevel || 'debug',
    apiVersion: 'v2'
  }

  const isMP = isMiniProgram()
  const loginServiceConfig = {}

  if (options.customClientType) loginServiceConfig.customClientType = options.customClientType
  if (options.customTag) loginServiceConfig.customTag = options.customTag
  if (options.isFixedDeviceId !== undefined) loginServiceConfig.isFixedDeviceId = options.isFixedDeviceId

  if (isMP) {
    loginServiceConfig.lbsUrls = options.lbsUrls || ['https://lbs.netease.im/lbs/wxwebconf.jsp']
    loginServiceConfig.linkUrl = options.linkUrl || 'wlnimsc0.netease.im'
    logger.info('检测到小程序环境，使用小程序专用连接配置', {
      lbsUrls: loginServiceConfig.lbsUrls,
      linkUrl: loginServiceConfig.linkUrl
    })
  } else {
    if (options.lbsUrls) loginServiceConfig.lbsUrls = options.lbsUrls
    if (options.linkUrl) loginServiceConfig.linkUrl = options.linkUrl
  }

  const otherOptions = {
    V2NIMLoginServiceConfig: loginServiceConfig
  }

  try {
    nimInstance = NIM.getInstance(initOptions, otherOptions)
    logger.success('NIM SDK 初始化成功', {
      appkey: initOptions.appkey,
      isMiniProgram: isMP
    })
    store.updateSdkState({ initialized: true })
    registerGlobalListeners()
    return nimInstance
  } catch (error) {
    logger.error('NIM SDK 初始化失败', { message: error.message })
    throw error
  }
}

export function getNIM() {
  return nimInstance
}

export function assertNIM() {
  if (!nimInstance) {
    throw new Error('SDK未初始化，请先在登录页点击"初始化SDK"')
  }
  return nimInstance
}

export async function destroyNIM() {
  if (nimInstance) {
    try {
      removeGlobalListeners()
      await nimInstance.destroy()
      nimInstance = null
      store.resetSdkState()
      logger.success('NIM SDK 已销毁')
    } catch (error) {
      logger.error('NIM SDK 销毁失败', { message: error.message })
      throw error
    }
  }
}

export function isInitialized() {
  return nimInstance !== null
}

export function getSDKVersion() {
  return NIM.sdkVersionFormat || 'unknown'
}

// ==================== 全局事件监听 ====================

const LOGIN_STATUS_MAP = { 0: '未登录', 1: '已登录', 2: '登录中', 3: '退避中' }
const CONNECT_STATUS_MAP = { 0: '未连接', 1: '已连接', 2: '连接中', 3: '等待重连' }
const CLIENT_CHANGE_MAP = { 1: '列表刷新', 2: '端登录', 3: '端登出' }

function syncStateFromSDK() {
  if (!nimInstance) return
  const service = nimInstance.V2NIMLoginService
  store.updateSdkState({
    initialized: true,
    loginStatus: service.getLoginStatus(),
    connectStatus: service.getConnectStatus(),
    loginUser: service.getLoginUser() || null
  })
}

const globalHandlers = {
  onLoginStatus(status) {
    logger.info('事件: onLoginStatus', { status, desc: LOGIN_STATUS_MAP[status] || '未知' })
    syncStateFromSDK()
  },
  onLoginFailed(error) {
    logger.error('事件: onLoginFailed', { code: error.code, desc: error.desc })
    syncStateFromSDK()
  },
  onKickedOffline(detail) {
    logger.warn('事件: onKickedOffline', detail)
    syncStateFromSDK()
  },
  onLoginClientChanged(change, clients) {
    logger.info('事件: onLoginClientChanged', {
      change: CLIENT_CHANGE_MAP[change] || change,
      clientCount: clients.length
    })
  },
  onConnectStatus(status) {
    logger.info('事件: onConnectStatus', { status, desc: CONNECT_STATUS_MAP[status] || '未知' })
    store.updateSdkState({ connectStatus: status })
  },
  onDisconnected(error) {
    logger.warn('事件: onDisconnected', { code: error.code, desc: error.desc })
    store.updateSdkState({ connectStatus: 0 })
  },
  onConnectFailed(error) {
    logger.error('事件: onConnectFailed', { code: error.code, desc: error.desc })
  },
  onDataSync(type, state, error) {
    logger.info('事件: onDataSync', { type, state, error: error ? error.desc : null })
  }
}

function registerGlobalListeners() {
  if (!nimInstance || globalListenersRegistered) return

  const service = nimInstance.V2NIMLoginService
  Object.keys(globalHandlers).forEach(eventName => {
    service.on(eventName, globalHandlers[eventName])
  })
  globalListenersRegistered = true
  logger.info('全局事件监听已注册', { events: Object.keys(globalHandlers) })
}

function removeGlobalListeners() {
  if (!nimInstance || !globalListenersRegistered) return

  const service = nimInstance.V2NIMLoginService
  Object.keys(globalHandlers).forEach(eventName => {
    service.off(eventName, globalHandlers[eventName])
  })
  globalListenersRegistered = false
}

export { NIM }

export default {
  initNIM,
  getNIM,
  assertNIM,
  destroyNIM,
  isInitialized,
  getSDKVersion,
  NIM
}

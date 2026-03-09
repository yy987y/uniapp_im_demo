/**
 * 网易云信 IM SDK 管理器
 * 基于 nim-web-sdk-ng V2 API
 */
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK'

// SDK 实例
let nimInstance = null

// 日志回调
let logCallback = null

// 事件监听器集合
const eventListeners = new Map()

/**
 * 日志工具
 */
const logger = {
  setCallback(callback) {
    logCallback = callback
  },
  
  log(type, message, data = null) {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = {
      time: timestamp,
      type,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    }
    
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`, data || '')
    
    if (logCallback) {
      logCallback(logEntry)
    }
  },
  
  info(message, data) {
    this.log('info', message, data)
  },
  
  success(message, data) {
    this.log('success', message, data)
  },
  
  error(message, data) {
    this.log('error', message, data)
  },
  
  warn(message, data) {
    this.log('warn', message, data)
  }
}

/**
 * 初始化 NIM SDK
 * @param {Object} options - 初始化配置
 * @returns {Object} NIM 实例
 */
export function initNIM(options = {}) {
  const defaultOptions = {
    appkey: options.appkey || '4727023efa991d31d61b3b32e819bd5b',
    debugLevel: options.debugLevel || 'debug',
    apiVersion: 'v2'
  }
  
  const otherOptions = {
    V2NIMLoginServiceConfig: {
      lbsUrls: options.lbsUrls || undefined,
      linkUrl: options.linkUrl || undefined,
      customClientType: options.customClientType || undefined,
      customTag: options.customTag || undefined,
      isFixedDeviceId: options.isFixedDeviceId !== undefined ? options.isFixedDeviceId : false
    }
  }
  
  try {
    nimInstance = NIM.getInstance(defaultOptions, otherOptions)
    logger.success('NIM SDK 初始化成功', { appkey: defaultOptions.appkey })
    return nimInstance
  } catch (error) {
    logger.error('NIM SDK 初始化失败', error)
    throw error
  }
}

/**
 * 获取 NIM 实例
 * @returns {Object|null}
 */
export function getNIM() {
  return nimInstance
}

/**
 * 销毁 NIM 实例
 */
export async function destroyNIM() {
  if (nimInstance) {
    try {
      await nimInstance.destroy()
      nimInstance = null
      logger.success('NIM SDK 已销毁')
    } catch (error) {
      logger.error('NIM SDK 销毁失败', error)
      throw error
    }
  }
}

/**
 * 检查 SDK 是否已初始化
 */
export function isInitialized() {
  return nimInstance !== null
}

/**
 * 设置日志回调
 */
export function setLogCallback(callback) {
  logger.setCallback(callback)
}

/**
 * 获取日志工具
 */
export function getLogger() {
  return logger
}

// ==================== V2NIMLoginService ====================

/**
 * 登录
 * @param {string} accountId - 账号ID
 * @param {string} token - 登录token
 * @param {Object} loginOption - 登录选项
 */
export async function login(accountId, token, loginOption = {}) {
  if (!nimInstance) {
    throw new Error('NIM SDK 未初始化')
  }
  
  try {
    logger.info('开始登录...', { accountId })
    await nimInstance.V2NIMLoginService.login(accountId, token, loginOption)
    logger.success('登录成功', { accountId })
  } catch (error) {
    logger.error('登录失败', { code: error.code, message: error.message })
    throw error
  }
}

/**
 * 登出
 */
export async function logout() {
  if (!nimInstance) {
    throw new Error('NIM SDK 未初始化')
  }
  
  try {
    logger.info('开始登出...')
    await nimInstance.V2NIMLoginService.logout()
    logger.success('登出成功')
  } catch (error) {
    logger.error('登出失败', error)
    throw error
  }
}

/**
 * 获取当前登录用户
 */
export function getLoginUser() {
  if (!nimInstance) return null
  return nimInstance.V2NIMLoginService.getLoginUser()
}

/**
 * 获取登录状态
 */
export function getLoginStatus() {
  if (!nimInstance) return null
  return nimInstance.V2NIMLoginService.getLoginStatus()
}

/**
 * 获取连接状态
 */
export function getConnectStatus() {
  if (!nimInstance) return null
  return nimInstance.V2NIMLoginService.getConnectStatus()
}

/**
 * 获取当前登录客户端信息
 */
export function getCurrentLoginClient() {
  if (!nimInstance) return null
  return nimInstance.V2NIMLoginService.getCurrentLoginClient()
}

/**
 * 获取多端登录客户端列表
 */
export function getLoginClients() {
  if (!nimInstance) return []
  return nimInstance.V2NIMLoginService.getLoginClients()
}

/**
 * 踢出其他端
 * @param {Object} client - 客户端信息
 */
export async function kickOffline(client) {
  if (!nimInstance) {
    throw new Error('NIM SDK 未初始化')
  }
  
  try {
    logger.info('踢出其他端...', client)
    await nimInstance.V2NIMLoginService.kickOffline(client)
    logger.success('踢出成功')
  } catch (error) {
    logger.error('踢出失败', error)
    throw error
  }
}

/**
 * 获取被踢下线详情
 */
export function getKickedOfflineDetail() {
  if (!nimInstance) return null
  return nimInstance.V2NIMLoginService.getKickedOfflineDetail()
}

/**
 * 获取数据同步状态
 */
export function getDataSync() {
  if (!nimInstance) return null
  return nimInstance.V2NIMLoginService.getDataSync()
}

// ==================== 事件监听管理 ====================

/**
 * 注册登录服务事件监听
 */
export function registerLoginListeners(callbacks = {}) {
  if (!nimInstance) return
  
  const service = nimInstance.V2NIMLoginService
  
  if (callbacks.onLoginStatus) {
    service.on('onLoginStatus', callbacks.onLoginStatus)
  }
  if (callbacks.onLoginFailed) {
    service.on('onLoginFailed', callbacks.onLoginFailed)
  }
  if (callbacks.onKickedOffline) {
    service.on('onKickedOffline', callbacks.onKickedOffline)
  }
  if (callbacks.onLoginClientChanged) {
    service.on('onLoginClientChanged', callbacks.onLoginClientChanged)
  }
  if (callbacks.onConnectStatus) {
    service.on('onConnectStatus', callbacks.onConnectStatus)
  }
  if (callbacks.onDisconnected) {
    service.on('onDisconnected', callbacks.onDisconnected)
  }
  if (callbacks.onConnectFailed) {
    service.on('onConnectFailed', callbacks.onConnectFailed)
  }
  if (callbacks.onDataSync) {
    service.on('onDataSync', callbacks.onDataSync)
  }
  
  logger.info('登录服务事件监听已注册')
}

/**
 * 移除登录服务事件监听
 */
export function removeLoginListeners() {
  if (!nimInstance) return
  
  const service = nimInstance.V2NIMLoginService
  service.removeAllListeners()
  
  logger.info('登录服务事件监听已移除')
}

// ==================== 导出SDK常量 ====================

export { NIM }

export default {
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
  removeLoginListeners
}

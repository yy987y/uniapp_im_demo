/**
 * 日志中心
 * 单一数据源：所有日志写入全局 store，页面通过 storeSync mixin 自动同步
 */
import store from './store.js'

function log(type, message, data = null) {
  const entry = {
    time: new Date().toLocaleTimeString(),
    type,
    message,
    data: data !== null && data !== undefined
      ? (typeof data === 'string' ? data : JSON.stringify(data, null, 2))
      : null
  }

  store.pushLog(entry)
  console.log(`[${entry.time}] [${type.toUpperCase()}] ${message}`, data || '')
}

export default {
  info(msg, data) { log('info', msg, data) },
  success(msg, data) { log('success', msg, data) },
  error(msg, data) { log('error', msg, data) },
  warn(msg, data) { log('warn', msg, data) },
  clear() { store.clearLogs() }
}

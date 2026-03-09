# SDK Wrapper (utils/nim-sdk.js)

```javascript
/**
 * Netease Yunxin IM SDK Manager
 * Based on nim-web-sdk-ng V2 API
 */
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK'

let nimInstance = null
let logCallback = null

const logger = {
  setCallback(cb) { logCallback = cb },
  log(type, message, data = null) {
    const entry = {
      time: new Date().toLocaleTimeString(),
      type,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    }
    console.log(`[${entry.time}] [${type.toUpperCase()}] ${message}`, data || '')
    if (logCallback) logCallback(entry)
  },
  info(msg, data) { this.log('info', msg, data) },
  success(msg, data) { this.log('success', msg, data) },
  error(msg, data) { this.log('error', msg, data) },
  warn(msg, data) { this.log('warn', msg, data) }
}

export function initNIM(options = {}) {
  try {
    nimInstance = NIM.getInstance({
      appkey: options.appkey || '',
      debugLevel: options.debugLevel || 'debug'
    })
    logger.success('NIM SDK initialized', { appkey: options.appkey })
    return nimInstance
  } catch (error) {
    logger.error('NIM SDK init failed', error)
    throw error
  }
}

export function getNIM() { return nimInstance }
export function isInitialized() { return nimInstance !== null }
export function setLogCallback(cb) { logger.setCallback(cb) }
export function getLogger() { return logger }

export async function destroyNIM() {
  if (nimInstance) {
    await nimInstance.destroy()
    nimInstance = null
    logger.success('NIM SDK destroyed')
  }
}

export { NIM }
export default { initNIM, getNIM, destroyNIM, isInitialized, setLogCallback, getLogger }
```

## Service Access Pattern

All V2 services accessed via `nim.V2NIM[ServiceName]`:

```javascript
const nim = getNIM()

nim.V2NIMLoginService        // Login
nim.V2NIMMessageService      // Message
nim.V2NIMConversationService // Conversation
nim.V2NIMTeamService         // Team
nim.V2NIMFriendService       // Friend
nim.V2NIMUserService         // User
nim.V2NIMSettingService      // Settings
nim.V2NIMStorageService      // Storage
nim.V2NIMSignallingService   // Signalling
nim.V2NIMAIService           // AI
nim.V2NIMNotificationService // Notification
```

/**
 * 全局响应式 Store — 单一数据源
 *
 * 解决的问题：
 * 1. 日志双源状态（全局存储 + 页面 logs[]）→ 合并为单一 reactive 源
 * 2. SDK 状态分散查询（每个页面独立 refreshStatus）→ 统一响应式快照
 *
 * UniApp Vue3 限制：跨页面无法共享 reactive() 引用（页面是独立 Vue 实例）
 * 解决方案：用普通 JS 对象 + 手动通知机制，页面通过 mixin 自动同步
 */

const MAX_LOGS = 500

const store = {
  logs: [],

  sdkState: {
    initialized: false,
    loginStatus: null,
    connectStatus: null,
    loginUser: null
  },

  _subscribers: new Set(),

  notify() {
    this._subscribers.forEach(fn => {
      try { fn() } catch (e) { console.error('[Store] subscriber error:', e) }
    })
  },

  subscribe(fn) {
    this._subscribers.add(fn)
    return () => this._subscribers.delete(fn)
  },

  pushLog(entry) {
    this.logs.push(entry)
    if (this.logs.length > MAX_LOGS) this.logs.shift()
    this.notify()
  },

  clearLogs() {
    this.logs.length = 0
    this.notify()
  },

  updateSdkState(partial) {
    Object.assign(this.sdkState, partial)
    this.notify()
  },

  resetSdkState() {
    this.sdkState.initialized = false
    this.sdkState.loginStatus = null
    this.sdkState.connectStatus = null
    this.sdkState.loginUser = null
    this.notify()
  }
}

/**
 * Vue mixin — 页面引入后自动获得 store 数据的响应式同步
 *
 * 用法：mixins: [storeSync]
 * 自动注入：this.storeLogs, this.sdkState, this.clearStoreLogs()
 */
export const storeSync = {
  data() {
    return {
      storeLogs: store.logs,
      sdkState: { ...store.sdkState }
    }
  },
  created() {
    this._storeUnsub = store.subscribe(() => {
      this.storeLogs = [...store.logs]
      this.sdkState = { ...store.sdkState }
    })
    this.storeLogs = [...store.logs]
    this.sdkState = { ...store.sdkState }
  },
  beforeUnmount() {
    if (this._storeUnsub) this._storeUnsub()
  },
  // UniApp 页面用 onUnload 而不是 beforeUnmount
  onUnload() {
    if (this._storeUnsub) this._storeUnsub()
  },
  methods: {
    clearStoreLogs() {
      store.clearLogs()
    }
  }
}

export default store

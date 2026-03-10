<template>
  <view class="container">
    <!-- SDK 初始化 -->
    <view class="card">
      <view class="card-title">SDK 初始化</view>

      <view class="input-group">
        <view class="input-label">AppKey <text class="required">*</text></view>
        <input class="input-field" v-model="initConfig.appkey" placeholder="请输入AppKey" />
      </view>

      <view class="input-group">
        <view class="input-label">调试级别</view>
        <picker :range="debugLevelOptions" :range-key="'label'" @change="onDebugLevelChange">
          <view class="picker-text">{{ selectedDebugLevel }}</view>
        </picker>
      </view>

      <view class="btn-group">
        <view class="btn" @click="handleInitSDK">初始化 SDK</view>
        <view class="btn btn-warning" v-if="sdkState.initialized" @click="handleDestroySDK">销毁 SDK</view>
      </view>

      <view class="status-info" v-if="sdkState.initialized">
        <text class="status-tag status-online">SDK 已初始化</text>
      </view>
    </view>

    <!-- V2NIMLoginService APIs -->
    <ApiTester
      v-for="api in loginApis"
      :key="api.name"
      :api-name="api.name"
      :params="api.params"
      :api-function="api.fn"
    />

    <!-- 日志面板 — 自动从 store 读取 -->
    <LogPanel height="400rpx" />
  </view>
</template>

<script>
import nimSdk from '@/utils/nim-sdk.js'
import { storeSync } from '@/utils/store.js'
import { createApiFunction } from '@/utils/api-executor.js'
import ApiTester from '@/components/ApiTester.vue'
import LogPanel from '@/components/LogPanel.vue'

const LOGIN_STATUS_MAP = { 0: '未登录', 1: '已登录', 2: '登录中', 3: '退避中' }
const CONNECT_STATUS_MAP = { 0: '未连接', 1: '已连接', 2: '连接中', 3: '等待重连' }

export default {
  components: { ApiTester, LogPanel },
  mixins: [storeSync],
  data() {
    return {
      initConfig: {
        appkey: '4727023efa991d31d61b3b32e819bd5b',
        debugLevel: 'debug'
      },
      debugLevelOptions: [
        { label: '关闭 (off)', value: 'off' },
        { label: '调试 (debug)', value: 'debug' },
        { label: '日志 (log)', value: 'log' }
      ],
      selectedDebugLevelIndex: 1,

      loginApis: [
        {
          name: 'login',
          params: [
            { name: 'accountId', type: 'string', required: true, placeholder: '请输入账号ID' },
            { name: 'token', type: 'string', required: true, placeholder: '请输入Token' },
            { name: 'retryCount', type: 'number', default: 3, description: '重试次数' },
            { name: 'timeout', type: 'number', default: 60000, description: '超时时间(ms)' },
            { name: 'forceMode', type: 'boolean', default: false, description: '强制登录(挤掉其他端)' },
            { name: 'authType', type: 'select', default: 0, options: [
              { label: '静态Token', value: 0 },
              { label: '动态Token', value: 1 },
              { label: '第三方鉴权', value: 2 }
            ], description: '鉴权模式' }
          ],
          fn: createApiFunction({
            service: 'V2NIMLoginService',
            method: 'login',
            argMode: 'custom',
            buildArgs(params) {
              const loginOption = {}
              if (params.retryCount !== undefined && params.retryCount !== '') loginOption.retryCount = params.retryCount
              if (params.timeout !== undefined && params.timeout !== '') loginOption.timeout = params.timeout
              if (params.forceMode !== undefined) loginOption.forceMode = params.forceMode
              if (params.authType !== undefined) loginOption.authType = params.authType
              return [params.accountId, params.token, loginOption]
            }
          })
        },
        {
          name: 'logout',
          params: [],
          fn: createApiFunction({
            service: 'V2NIMLoginService',
            method: 'logout',
            argMode: 'none'
          })
        },
        {
          name: 'getLoginUser',
          params: [],
          fn: createApiFunction({
            service: 'V2NIMLoginService',
            method: 'getLoginUser',
            argMode: 'none',
            formatResult: (user) => ({ loginUser: user || '(未登录)' })
          })
        },
        {
          name: 'getLoginStatus',
          params: [],
          fn: createApiFunction({
            service: 'V2NIMLoginService',
            method: 'getLoginStatus',
            argMode: 'none',
            formatResult: (status) => ({ status, desc: LOGIN_STATUS_MAP[status] || '未知' })
          })
        },
        {
          name: 'getConnectStatus',
          params: [],
          fn: createApiFunction({
            service: 'V2NIMLoginService',
            method: 'getConnectStatus',
            argMode: 'none',
            formatResult: (status) => ({ status, desc: CONNECT_STATUS_MAP[status] || '未知' })
          })
        },
        {
          name: 'getCurrentLoginClient',
          params: [],
          fn: createApiFunction({
            service: 'V2NIMLoginService',
            method: 'getCurrentLoginClient',
            argMode: 'none',
            formatResult: (client) => client || { message: '无登录客户端信息' }
          })
        },
        {
          name: 'getLoginClients',
          params: [],
          fn: createApiFunction({
            service: 'V2NIMLoginService',
            method: 'getLoginClients',
            argMode: 'none',
            formatResult: (clients) => ({ count: clients.length, clients })
          })
        },
        {
          name: 'kickOffline',
          params: [
            { name: 'client', type: 'object', required: true, placeholder: '{"clientId":"..."}', description: '从 getLoginClients 获取的客户端对象' }
          ],
          fn: createApiFunction({
            service: 'V2NIMLoginService',
            method: 'kickOffline',
            argMode: 'custom',
            buildArgs(params) { return [params.client] }
          })
        },
        {
          name: 'getKickedOfflineDetail',
          params: [],
          fn: createApiFunction({
            service: 'V2NIMLoginService',
            method: 'getKickedOfflineDetail',
            argMode: 'none',
            formatResult: (detail) => detail || { message: '无被踢记录' }
          })
        },
        {
          name: 'getDataSync',
          params: [],
          fn: createApiFunction({
            service: 'V2NIMLoginService',
            method: 'getDataSync',
            argMode: 'none',
            formatResult: (data) => data || { message: '无数据同步信息' }
          })
        }
      ]
    }
  },
  computed: {
    selectedDebugLevel() {
      return this.debugLevelOptions[this.selectedDebugLevelIndex]?.label || '调试 (debug)'
    }
  },
  onLoad() {
    const saved = uni.getStorageSync('nim_init_config')
    if (saved) {
      this.initConfig = { ...this.initConfig, ...saved }
    }
  },
  methods: {
    onDebugLevelChange(e) {
      this.selectedDebugLevelIndex = e.detail.value
      this.initConfig.debugLevel = this.debugLevelOptions[e.detail.value].value
    },

    handleInitSDK() {
      if (!this.initConfig.appkey) {
        uni.showToast({ title: '请输入AppKey', icon: 'none' })
        return
      }
      try {
        nimSdk.initNIM({
          appkey: this.initConfig.appkey,
          debugLevel: this.initConfig.debugLevel
        })
        uni.setStorageSync('nim_init_config', this.initConfig)
        uni.showToast({ title: '初始化成功', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '失败: ' + e.message, icon: 'none' })
      }
    },

    async handleDestroySDK() {
      try {
        await nimSdk.destroyNIM()
        uni.showToast({ title: '销毁成功', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '失败: ' + e.message, icon: 'none' })
      }
    }
  }
}
</script>

<style scoped>
.container { padding: 20rpx; }
.card { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05); }
.card-title { font-size: 32rpx; font-weight: bold; margin-bottom: 20rpx; padding-bottom: 16rpx; border-bottom: 1px solid #eee; }
.input-group { margin-bottom: 20rpx; }
.input-label { font-size: 26rpx; color: #666; margin-bottom: 8rpx; }
.required { color: #ff3b30; }
.picker-text { height: 70rpx; line-height: 70rpx; border: 1px solid #e0e0e0; border-radius: 6rpx; padding: 0 20rpx; background: #fff; }
.btn-group { display: flex; gap: 16rpx; margin-bottom: 20rpx; }
.btn-group .btn { flex: 1; margin-bottom: 0; }
.status-info { display: flex; align-items: center; }
.status-tag { display: inline-block; padding: 6rpx 16rpx; border-radius: 20rpx; font-size: 22rpx; }
.status-online { background-color: #e8f5e9; color: #4caf50; }
</style>

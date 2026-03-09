<template>
  <view class="container">
    <!-- SDK 初始化 -->
    <view class="card">
      <view class="card-title">SDK 初始化配置</view>
      
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
      
      <view class="btn" @click="handleInitSDK">初始化 SDK</view>
    </view>

    <!-- 登录 -->
    <view class="card">
      <view class="card-title">V2NIMLoginService APIs</view>
      
      <ApiTester api-name="login" :params="loginParams" :api-function="apiLogin" :default-expanded="true" />
      <ApiTester api-name="logout" :params="[]" :api-function="apiLogout" />
      <ApiTester api-name="getLoginUser" :params="[]" :api-function="apiGetLoginUser" />
      <ApiTester api-name="getLoginStatus" :params="[]" :api-function="apiGetLoginStatus" />
      <ApiTester api-name="getConnectStatus" :params="[]" :api-function="apiGetConnectStatus" />
      <ApiTester api-name="getDataSync" :params="[]" :api-function="apiGetDataSync" />
      <ApiTester api-name="getCurrentLoginClient" :params="[]" :api-function="apiGetCurrentLoginClient" />
      <ApiTester api-name="getLoginClients" :params="[]" :api-function="apiGetLoginClients" />
      <ApiTester api-name="kickOffline" :params="kickOfflineParams" :api-function="apiKickOffline" />
      <ApiTester api-name="getKickedOfflineDetail" :params="[]" :api-function="apiGetKickedOfflineDetail" />
    </view>

    <view class="card">
      <view class="card-title">事件监听</view>
      <view class="btn btn-secondary" @click="registerListeners">注册监听</view>
      <view class="btn btn-warning" @click="removeListeners">移除监听</view>
    </view>

    <LogPanel :logs="logs" height="400rpx" @clear="clearLogs" />
  </view>
</template>

<script>
import nimSdk from '@/utils/nim-sdk.js'
import ApiTester from '@/components/ApiTester.vue'
import LogPanel from '@/components/LogPanel.vue'

export default {
  components: { ApiTester, LogPanel },
  data() {
    return {
      logs: [],
      initConfig: { appkey: '', debugLevel: 'debug' },
      debugLevelOptions: [
        { label: '关闭 (off)', value: 'off' },
        { label: '调试 (debug)', value: 'debug' },
        { label: '日志 (log)', value: 'log' }
      ],
      selectedDebugLevelIndex: 1,
      loginParams: [
        { name: 'accountId', type: 'string', required: true, placeholder: '账号ID',value:'yanchaodemo' },
        { name: 'token', type: 'string', required: true, placeholder: 'Token' ,value:'111111'},
        { name: 'forceMode', type: 'boolean', default: false }
      ],
      kickOfflineParams: [
        { name: 'client', type: 'object', required: true, placeholder: '客户端对象JSON' }
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
    if (saved) this.initConfig = { ...this.initConfig, ...saved }
    nimSdk.setLogCallback((log) => { this.logs.push(log); if (this.logs.length > 200) this.logs.shift() })
  },
  methods: {
    clearLogs() { this.logs = [] },
    onDebugLevelChange(e) { this.selectedDebugLevelIndex = e.detail.value; this.initConfig.debugLevel = this.debugLevelOptions[e.detail.value].value },
    handleInitSDK() {
      if (!this.initConfig.appkey) { uni.showToast({ title: '请输入AppKey', icon: 'none' }); return }
      try {
        nimSdk.initNIM({ appkey: this.initConfig.appkey, debugLevel: this.initConfig.debugLevel })
        uni.setStorageSync('nim_init_config', this.initConfig)
        uni.showToast({ title: '初始化成功', icon: 'success' })
      } catch (e) { uni.showToast({ title: '失败: ' + e.message, icon: 'none' }) }
    },
    getNIM() { const nim = nimSdk.getNIM(); if (!nim) throw new Error('SDK未初始化'); return nim },
    async apiLogin(params) { const nim = this.getNIM(); await nim.V2NIMLoginService.login(params.accountId, params.token, { forceMode: params.forceMode }); return { success: true } },
    async apiLogout() { const nim = this.getNIM(); await nim.V2NIMLoginService.logout(); return { success: true } },
    async apiGetLoginUser() { return { user: this.getNIM().V2NIMLoginService.getLoginUser() } },
    async apiGetLoginStatus() { const s = this.getNIM().V2NIMLoginService.getLoginStatus(); return { status: s, text: ['未登录','已登录','登录中','退避中'][s] } },
    async apiGetConnectStatus() { const s = this.getNIM().V2NIMLoginService.getConnectStatus(); return { status: s, text: ['未连接','已连接','连接中','等待重连'][s] } },
    async apiGetDataSync() { return { dataSync: this.getNIM().V2NIMLoginService.getDataSync() } },
    async apiGetCurrentLoginClient() { return { client: this.getNIM().V2NIMLoginService.getCurrentLoginClient() } },
    async apiGetLoginClients() { const c = this.getNIM().V2NIMLoginService.getLoginClients(); return { clients: c, count: c.length } },
    async apiKickOffline(params) { await this.getNIM().V2NIMLoginService.kickOffline(params.client); return { success: true } },
    async apiGetKickedOfflineDetail() { return { detail: this.getNIM().V2NIMLoginService.getKickedOfflineDetail() } },
    registerListeners() { nimSdk.registerLoginListeners({ onLoginStatus: (s) => nimSdk.getLogger().info('登录状态', {s}), onKickedOffline: (d) => nimSdk.getLogger().warn('被踢', d) }); uni.showToast({ title: '已注册', icon: 'success' }) },
    removeListeners() { nimSdk.removeLoginListeners(); uni.showToast({ title: '已移除', icon: 'success' }) }
  }
}
</script>

<style scoped>
.container { padding: 20rpx; }
.card { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 20rpx; }
.card-title { font-size: 32rpx; font-weight: bold; margin-bottom: 20rpx; padding-bottom: 16rpx; border-bottom: 1px solid #eee; }
.input-group { margin-bottom: 20rpx; }
.input-label { font-size: 26rpx; color: #666; margin-bottom: 8rpx; }
.required { color: #ff3b30; }
.input-field { width: 100%; height: 70rpx; border: 1px solid #e0e0e0; border-radius: 6rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; }
.picker-text { height: 70rpx; line-height: 70rpx; border: 1px solid #e0e0e0; border-radius: 6rpx; padding: 0 20rpx; background: #fff; }
</style>

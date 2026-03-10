<template>
  <view class="container">
    <!-- SDK 状态卡片 -->
    <view class="card">
      <view class="card-title">SDK 状态</view>
      <view class="status-row">
        <text class="status-label">初始化状态:</text>
        <text class="status-tag" :class="sdkState.initialized ? 'status-online' : 'status-offline'">
          {{ sdkState.initialized ? '已初始化' : '未初始化' }}
        </text>
      </view>
      <view class="status-row">
        <text class="status-label">登录状态:</text>
        <text class="status-tag" :class="loginStatusClass">
          {{ loginStatusText }}
        </text>
      </view>
      <view v-if="sdkState.loginUser" class="status-row">
        <text class="status-label">当前账号:</text>
        <text class="status-value">{{ sdkState.loginUser }}</text>
      </view>
      <view class="status-row">
        <text class="status-label">SDK版本:</text>
        <text class="status-value">{{ sdkVersion }}</text>
      </view>
    </view>

    <!-- 快速操作 -->
    <view class="card" v-if="sdkState.initialized">
      <view class="card-title">快速操作</view>
      <view class="quick-actions">
        <view class="btn btn-danger" v-if="sdkState.loginStatus === 1" @click="handleLogout">登出</view>
        <view class="btn btn-warning" @click="handleDestroy">销毁SDK</view>
      </view>
    </view>

    <!-- 服务模块导航 -->
    <ServiceNavigator :is-logged-in="sdkState.loginStatus === 1" />

    <!-- 日志面板 — 自动从 store 读取，无需传 props -->
    <LogPanel height="400rpx" />
  </view>
</template>

<script>
import nimSdk from '@/utils/nim-sdk.js'
import { storeSync } from '@/utils/store.js'
import LogPanel from '@/components/LogPanel.vue'
import ServiceNavigator from '@/components/ServiceNavigator.vue'

const LOGIN_STATUS_MAP = { 0: '未登录', 1: '已登录', 2: '登录中', 3: '退避中' }

export default {
  components: { LogPanel, ServiceNavigator },
  mixins: [storeSync],
  data() {
    return {
      sdkVersion: ''
    }
  },
  computed: {
    loginStatusText() {
      const s = this.sdkState.loginStatus
      if (s === null) return '未初始化'
      return LOGIN_STATUS_MAP[s] || '未知'
    },
    loginStatusClass() {
      if (this.sdkState.loginStatus === 1) return 'status-online'
      if (this.sdkState.loginStatus === 2 || this.sdkState.loginStatus === 3) return 'status-connecting'
      return 'status-offline'
    }
  },
  onLoad() {
    this.sdkVersion = nimSdk.getSDKVersion()
  },
  methods: {
    async handleLogout() {
      const nim = nimSdk.getNIM()
      if (!nim) return
      try {
        await nim.V2NIMLoginService.logout()
        uni.showToast({ title: '登出成功', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: '登出失败: ' + error.message, icon: 'none' })
      }
    },

    async handleDestroy() {
      uni.showModal({
        title: '确认',
        content: '确定要销毁SDK实例吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await nimSdk.destroyNIM()
              uni.showToast({ title: '销毁成功', icon: 'success' })
            } catch (error) {
              uni.showToast({ title: '销毁失败: ' + error.message, icon: 'none' })
            }
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.container { padding: 20rpx; }
.status-row { display: flex; align-items: center; margin-bottom: 16rpx; }
.status-row:last-child { margin-bottom: 0; }
.status-label { font-size: 26rpx; color: #666666; width: 160rpx; }
.status-value { font-size: 26rpx; color: #333333; flex: 1; }
.quick-actions { display: flex; flex-wrap: wrap; gap: 16rpx; }
.quick-actions .btn { flex: 1; min-width: 200rpx; margin-bottom: 0; }
.card { background-color: #ffffff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05); }
.card-title { font-size: 32rpx; font-weight: bold; color: #333333; margin-bottom: 20rpx; padding-bottom: 16rpx; border-bottom: 1px solid #eeeeee; }
.status-tag { display: inline-block; padding: 6rpx 16rpx; border-radius: 20rpx; font-size: 22rpx; }
.status-online { background-color: #e8f5e9; color: #4caf50; }
.status-offline { background-color: #ffebee; color: #f44336; }
.status-connecting { background-color: #fff3e0; color: #ff9800; }
</style>

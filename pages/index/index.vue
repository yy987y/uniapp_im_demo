<template>
  <view class="container">
    <!-- SDK 状态卡片 -->
    <view class="card">
      <view class="card-title">SDK 状态</view>
      <view class="status-row">
        <text class="status-label">初始化状态:</text>
        <text class="status-tag" :class="sdkInitialized ? 'status-online' : 'status-offline'">
          {{ sdkInitialized ? '已初始化' : '未初始化' }}
        </text>
      </view>
      <view class="status-row">
        <text class="status-label">登录状态:</text>
        <text class="status-tag" :class="loginStatusClass">
          {{ loginStatusText }}
        </text>
      </view>
      <view v-if="currentAccount" class="status-row">
        <text class="status-label">当前账号:</text>
        <text class="status-value">{{ currentAccount }}</text>
      </view>
      <view class="status-row">
        <text class="status-label">SDK版本:</text>
        <text class="status-value">{{ sdkVersion }}</text>
      </view>
    </view>

    <!-- 快速操作 -->
    <view class="card">
      <view class="card-title">快速操作</view>
      <view class="quick-actions">
        <view class="btn" @click="goToLogin">初始化/登录</view>
        <view class="btn btn-danger" v-if="sdkInitialized" @click="handleLogout">登出</view>
        <view class="btn btn-warning" v-if="sdkInitialized" @click="handleDestroy">销毁SDK</view>
      </view>
    </view>

    <!-- 日志面板 -->
    <LogPanel 
      :logs="logs" 
      height="400rpx"
      @clear="clearLogs"
    />
  </view>
</template>

<script>
import nimSdk from '@/utils/nim-sdk.js'
import LogPanel from '@/components/LogPanel.vue'

export default {
  components: {
    LogPanel
  },
  data() {
    return {
      sdkVersion: 'v10.9.x',
      logs: [],
      sdkInitialized: false,
      currentAccount: null,
      loginStatus: null
    }
  },
  computed: {
    loginStatusText() {
      const status = this.loginStatus
      if (status === null) return '未初始化'
      switch (status) {
        case 0: return '未登录'
        case 1: return '已登录'
        case 2: return '登录中'
        case 3: return '退避中'
        default: return '未知'
      }
    },
    loginStatusClass() {
      const status = this.loginStatus
      if (status === 1) return 'status-online'
      if (status === 2 || status === 3) return 'status-connecting'
      return 'status-offline'
    }
  },
  onShow() {
    this.refreshStatus()
  },
  onLoad() {
    nimSdk.setLogCallback((log) => {
      this.logs.push(log)
      if (this.logs.length > 100) {
        this.logs.shift()
      }
    })
    this.refreshStatus()
  },
  methods: {
    refreshStatus() {
      this.sdkInitialized = nimSdk.isInitialized()
      this.currentAccount = nimSdk.getLoginUser()
      this.loginStatus = nimSdk.getLoginStatus()
    },
    
    goToLogin() {
      uni.navigateTo({ url: '/pages/login/login' })
    },
    
    async handleLogout() {
      try {
        await nimSdk.logout()
        this.refreshStatus()
        uni.showToast({
          title: '登出成功',
          icon: 'success'
        })
      } catch (error) {
        uni.showToast({
          title: '登出失败: ' + error.message,
          icon: 'none'
        })
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
              this.refreshStatus()
              uni.showToast({
                title: '销毁成功',
                icon: 'success'
              })
            } catch (error) {
              uni.showToast({
                title: '销毁失败: ' + error.message,
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    clearLogs() {
      this.logs = []
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
.status-tag { display: inline-block; padding: 6rpx 16rpx; border-radius: 20rpx; font-size: 22rpx; }
.status-online { background-color: #e8f5e9; color: #4caf50; }
.status-offline { background-color: #ffebee; color: #f44336; }
.status-connecting { background-color: #fff3e0; color: #ff9800; }
.card { background-color: #ffffff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 20rpx; box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05); }
.card-title { font-size: 32rpx; font-weight: bold; color: #333333; margin-bottom: 20rpx; padding-bottom: 16rpx; border-bottom: 1px solid #eeeeee; }
</style>
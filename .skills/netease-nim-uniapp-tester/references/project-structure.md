# Project Structure Reference

## Required Files

### manifest.json

```json
{
  "name": "云信IM SDK测试工具",
  "appid": "__UNI__NIMTEST",
  "versionName": "1.0.0",
  "versionCode": "100",
  "transformPx": false,
  "h5": {
    "devServer": { "port": 8080 },
    "router": { "mode": "hash" }
  },
  "vueVersion": "3"
}
```

### pages.json

```json
{
  "pages": [
    { "path": "pages/index/index", "style": { "navigationBarTitleText": "云信IM SDK测试" } },
    { "path": "pages/login/login", "style": { "navigationBarTitleText": "登录服务" } },
    { "path": "pages/message/message", "style": { "navigationBarTitleText": "消息服务" } },
    { "path": "pages/conversation/conversation", "style": { "navigationBarTitleText": "会话服务" } },
    { "path": "pages/team/team", "style": { "navigationBarTitleText": "群组服务" } },
    { "path": "pages/friend/friend", "style": { "navigationBarTitleText": "好友服务" } },
    { "path": "pages/user/user", "style": { "navigationBarTitleText": "用户服务" } },
    { "path": "pages/setting/setting", "style": { "navigationBarTitleText": "设置服务" } },
    { "path": "pages/storage/storage", "style": { "navigationBarTitleText": "存储服务" } },
    { "path": "pages/signalling/signalling", "style": { "navigationBarTitleText": "信令服务" } },
    { "path": "pages/ai/ai", "style": { "navigationBarTitleText": "AI服务" } },
    { "path": "pages/notification/notification", "style": { "navigationBarTitleText": "通知服务" } }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  }
}
```

### App.vue

```vue
<template>
  <view class="app"><router-view /></view>
</template>

<script>
export default {
  onLaunch() { console.log('App Launch') }
}
</script>

<style>
page { background: #f5f5f5; font-size: 14px; }
.container { padding: 20rpx; }
.card { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 20rpx; }
.card-title { font-size: 32rpx; font-weight: bold; margin-bottom: 20rpx; padding-bottom: 16rpx; border-bottom: 1px solid #eee; }
.btn { display: flex; align-items: center; justify-content: center; height: 80rpx; background: #007AFF; color: #fff; border-radius: 8rpx; margin-bottom: 20rpx; }
.btn:active { opacity: 0.8; }
.btn-secondary { background: #4CD964; }
.btn-warning { background: #FF9500; }
.btn-danger { background: #FF3B30; }
.input-group { margin-bottom: 20rpx; }
.input-label { font-size: 26rpx; color: #666; margin-bottom: 8rpx; }
.input-field { width: 100%; height: 70rpx; border: 1px solid #e0e0e0; border-radius: 6rpx; padding: 0 20rpx; box-sizing: border-box; }
</style>
```

## Directory Commands

```bash
# Create directories
mkdir -p pages/index pages/login pages/message pages/conversation
mkdir -p pages/team pages/friend pages/user pages/setting
mkdir -p pages/storage pages/signalling pages/ai pages/notification
mkdir -p components utils static
```

## Home Page (pages/index/index.vue)

```vue
<template>
  <view class="container">
    <view class="card">
      <view class="card-title">SDK 状态</view>
      <view class="status-row">
        <text>初始化: </text>
        <text :class="sdkInit ? 'online' : 'offline'">{{ sdkInit ? '已初始化' : '未初始化' }}</text>
      </view>
      <view class="status-row">
        <text>登录: </text>
        <text :class="loggedIn ? 'online' : 'offline'">{{ loginStatusText }}</text>
      </view>
    </view>
    
    <view class="card">
      <view class="card-title">服务模块</view>
      <view class="module-grid">
        <view v-for="m in modules" :key="m.path" class="module-item" @click="goTo(m)">
          <text class="module-icon">{{ m.icon }}</text>
          <text class="module-name">{{ m.name }}</text>
        </view>
      </view>
    </view>
    
    <LogPanel :logs="logs" @clear="logs = []" />
  </view>
</template>

<script>
import nimSdk from '@/utils/nim-sdk.js'
import LogPanel from '@/components/LogPanel.vue'

export default {
  components: { LogPanel },
  data() {
    return {
      logs: [],
      modules: [
        { name: '登录', icon: '🔐', path: '/pages/login/login' },
        { name: '消息', icon: '💬', path: '/pages/message/message' },
        { name: '会话', icon: '📝', path: '/pages/conversation/conversation' },
        { name: '群组', icon: '👥', path: '/pages/team/team' },
        { name: '好友', icon: '🤝', path: '/pages/friend/friend' },
        { name: '用户', icon: '👤', path: '/pages/user/user' },
        { name: '设置', icon: '⚙️', path: '/pages/setting/setting' },
        { name: '存储', icon: '📁', path: '/pages/storage/storage' },
        { name: '信令', icon: '📡', path: '/pages/signalling/signalling' },
        { name: 'AI', icon: '🤖', path: '/pages/ai/ai' },
        { name: '通知', icon: '🔔', path: '/pages/notification/notification' }
      ]
    }
  },
  computed: {
    sdkInit() { return nimSdk.isInitialized() },
    loggedIn() { return nimSdk.getLoginStatus() === 1 },
    loginStatusText() {
      const s = nimSdk.getLoginStatus()
      return s === null ? '未初始化' : ['未登录','已登录','登录中','退避中'][s]
    }
  },
  onLoad() {
    nimSdk.setLogCallback(log => {
      this.logs.push(log)
      if (this.logs.length > 100) this.logs.shift()
    })
  },
  methods: {
    goTo(m) { uni.navigateTo({ url: m.path }) }
  }
}
</script>

<style scoped>
.status-row { margin-bottom: 12rpx; }
.online { color: #4caf50; }
.offline { color: #f44336; }
.module-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.module-item { width: calc(33.33% - 12rpx); background: #f8f9fa; border-radius: 12rpx; padding: 24rpx; text-align: center; }
.module-icon { font-size: 48rpx; display: block; margin-bottom: 8rpx; }
.module-name { font-size: 26rpx; }
</style>
```

## Service Page Template

```vue
<template>
  <view class="container">
    <view class="card">
      <view class="card-title">V2NIM[Service]Service APIs</view>
      
      <ApiTester
        api-name="methodName"
        :params="methodParams"
        :api-function="apiMethod"
      />
      
      <!-- More ApiTester components -->
    </view>
    
    <LogPanel :logs="logs" @clear="logs = []" />
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
      methodParams: [
        { name: 'param1', type: 'string', required: true }
      ]
    }
  },
  onLoad() {
    nimSdk.setLogCallback(log => {
      this.logs.push(log)
      if (this.logs.length > 100) this.logs.shift()
    })
  },
  methods: {
    getNIM() {
      const nim = nimSdk.getNIM()
      if (!nim) throw new Error('SDK未初始化')
      return nim
    },
    async apiMethod(params) {
      const nim = this.getNIM()
      const result = await nim.V2NIMXxxService.methodName(params.param1)
      return result
    }
  }
}
</script>

<style scoped>
.container { padding: 20rpx; }
.card { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 20rpx; }
.card-title { font-size: 32rpx; font-weight: bold; margin-bottom: 20rpx; padding-bottom: 16rpx; border-bottom: 1px solid #eee; }
</style>
```

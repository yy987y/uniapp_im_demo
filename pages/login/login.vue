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

    <!-- IM 登录 -->
    <view class="card">
      <view class="card-title">IM 登录</view>
      
      <view class="input-group">
        <view class="input-label">账号 <text class="required">*</text></view>
        <input class="input-field" v-model="loginConfig.accountId" placeholder="请输入账号ID" />
      </view>
      
      <view class="input-group">
        <view class="input-label">Token <text class="required">*</text></view>
        <input class="input-field" v-model="loginConfig.token" placeholder="请输入Token" />
      </view>
      
      <view class="btn-group">
        <view class="btn" @click="handleLogin">登录 IM</view>
        <view class="btn btn-danger" @click="handleLogout">登出</view>
      </view>
      
      <view class="status-info" v-if="imLoginStatus !== null">
        <text class="status-label">IM状态:</text>
        <text class="status-tag" :class="imLoginStatus === 1 ? 'status-online' : 'status-offline'">
          {{ imLoginStatusText }}
        </text>
      </view>
    </view>

    <!-- 聊天室 -->
    <view class="card">
      <view class="card-title">聊天室登录</view>
      
      <view class="input-group">
        <view class="input-label">聊天室ID <text class="required">*</text></view>
        <input class="input-field" v-model="chatroomConfig.roomId" placeholder="请输入聊天室ID" />
      </view>
      
      <view class="btn-group">
        <view class="btn" @click="handleEnterChatroom">进入聊天室</view>
        <view class="btn btn-warning" @click="handleExitChatroom">退出聊天室</view>
      </view>
      
      <view class="status-info" v-if="chatroomStatus !== null">
        <text class="status-label">聊天室状态:</text>
        <text class="status-tag" :class="chatroomStatus === 'entered' ? 'status-online' : 'status-offline'">
          {{ chatroomStatusText }}
        </text>
      </view>
    </view>

    <!-- 一键操作 -->
    <view class="card">
      <view class="card-title">一键操作</view>
      <view class="btn btn-primary" @click="handleOneClickLogin">一键登录 (初始化 + IM登录 + 聊天室)</view>
      <view class="btn btn-danger" @click="handleOneClickLogout">一键登出 (聊天室 + IM)</view>
    </view>

    <!-- 事件监听 -->
    <view class="card">
      <view class="card-title">事件监听</view>
      <view class="btn-group">
        <view class="btn btn-secondary" @click="registerListeners">注册监听</view>
        <view class="btn btn-warning" @click="removeListeners">移除监听</view>
      </view>
    </view>

    <LogPanel :logs="logs" height="400rpx" @clear="clearLogs" />
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
      // SDK 初始化配置 - 默认 AppKey (小程序端)
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
      // IM 登录配置 - 默认账号
      loginConfig: {
        accountId: 'yanchaodemo',
        token: '111111'
      },
      // 聊天室配置 - 默认聊天室ID
      chatroomConfig: {
        roomId: '14037995981'
      },
      // 状态
      imLoginStatus: null,
      chatroomStatus: null
    }
  },
  computed: {
    selectedDebugLevel() {
      return this.debugLevelOptions[this.selectedDebugLevelIndex]?.label || '调试 (debug)'
    },
    imLoginStatusText() {
      const status = this.imLoginStatus
      switch (status) {
        case 0: return '未登录'
        case 1: return '已登录'
        case 2: return '登录中'
        case 3: return '退避中'
        default: return '未知'
      }
    },
    chatroomStatusText() {
      switch (this.chatroomStatus) {
        case 'entered': return '已进入'
        case 'entering': return '进入中'
        case 'exited': return '已退出'
        default: return '未进入'
      }
    }
  },
  onLoad() {
    // 加载保存的配置
    const saved = uni.getStorageSync('nim_init_config')
    if (saved) {
      this.initConfig = { ...this.initConfig, ...saved }
    }
    // 设置日志回调
    nimSdk.setLogCallback((log) => {
      this.logs.push(log)
      if (this.logs.length > 200) this.logs.shift()
    })
    // 刷新状态
    this.refreshStatus()
  },
  onShow() {
    this.refreshStatus()
  },
  methods: {
    clearLogs() {
      this.logs = []
    },
    
    refreshStatus() {
      this.imLoginStatus = nimSdk.getLoginStatus()
      this.chatroomStatus = nimSdk.isChatroomInitialized() ? 'entered' : null
    },
    
    onDebugLevelChange(e) {
      this.selectedDebugLevelIndex = e.detail.value
      this.initConfig.debugLevel = this.debugLevelOptions[e.detail.value].value
    },
    
    // 初始化 SDK
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
    
    // IM 登录
    async handleLogin() {
      if (!nimSdk.isInitialized()) {
        uni.showToast({ title: '请先初始化SDK', icon: 'none' })
        return
      }
      if (!this.loginConfig.accountId || !this.loginConfig.token) {
        uni.showToast({ title: '请输入账号和Token', icon: 'none' })
        return
      }
      try {
        await nimSdk.login(this.loginConfig.accountId, this.loginConfig.token)
        this.imLoginStatus = 1
        uni.showToast({ title: '登录成功', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '登录失败: ' + e.message, icon: 'none' })
      }
    },
    
    // IM 登出
    async handleLogout() {
      try {
        await nimSdk.logout()
        this.imLoginStatus = 0
        uni.showToast({ title: '登出成功', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '登出失败: ' + e.message, icon: 'none' })
      }
    },
    
    // 进入聊天室 (独立于 IM 登录)
    async handleEnterChatroom() {
      // 检查 SDK 是否初始化
      if (!nimSdk.isInitialized()) {
        // 如果 SDK 未初始化，自动初始化
        nimSdk.getLogger().info('SDK未初始化，自动初始化...')
        try {
          nimSdk.initNIM({
            appkey: this.initConfig.appkey,
            debugLevel: this.initConfig.debugLevel
          })
        } catch (e) {
          uni.showToast({ title: '初始化SDK失败', icon: 'none' })
          return
        }
      }
      
      if (!this.chatroomConfig.roomId) {
        uni.showToast({ title: '请输入聊天室ID', icon: 'none' })
        return
      }
      
      try {
        this.chatroomStatus = 'entering'
        const roomId = this.chatroomConfig.roomId
        // 优先使用 IM 已登录的账号，否则使用输入框的账号
        const accountId = nimSdk.getLoginUser() || this.loginConfig.accountId
        const token = this.loginConfig.token
        
        // 检测 IM 是否已登录
        const isIMLoggedIn = nimSdk.getLoginStatus() === 1
        
        // 参数校验
        if (!roomId) {
          throw new Error('聊天室ID不能为空')
        }
        if (!accountId) {
          throw new Error('账号ID不能为空')
        }
        if (!token) {
          throw new Error('Token不能为空')
        }
        
        // 1. 初始化聊天室实例
        nimSdk.getLogger().info('步骤1: 初始化聊天室实例...')
        nimSdk.initChatroom({
          appkey: this.initConfig.appkey,
          debugLevel: this.initConfig.debugLevel
        })
        
        // 2. 构建 linkProvider (根据 IM 登录状态选择不同策略)
        nimSdk.getLogger().info('步骤2: 准备进入聊天室', { 
          roomId,
          accountId,
          token: token ? `${token.substring(0, 2)}***` : 'null',
          isIMLoggedIn,
          linkStrategy: isIMLoggedIn ? '动态获取 (getChatroomLinkAddress)' : '固定地址 (wlnimsc1.netease.im:443)'
        })
        
        /**
         * linkProvider 策略:
         * - IM 已登录: 通过 getChatroomLinkAddress 动态获取链接地址
         * - IM 未登录: 直接返回固定地址 ["wlnimsc1.netease.im:443"]
         */
        const linkProvider = async (sdkParam1, sdkParam2) => {
          nimSdk.getLogger().info('linkProvider 被调用', { 
            sdkParam1,
            sdkParam2,
            roomIdFromClosure: roomId,
            isIMLoggedIn
          })
          
          if (isIMLoggedIn) {
            // IM 已登录，动态获取聊天室 Link 地址
            nimSdk.getLogger().info('IM已登录，调用 getChatroomLinkAddress 获取动态地址...')
            try {
              const linkAddresses = await nimSdk.getChatroomLinkAddress(roomId, true)
              nimSdk.getLogger().success('动态获取聊天室地址成功', { linkAddresses })
              return linkAddresses
            } catch (e) {
              // 如果动态获取失败，降级使用固定地址
              nimSdk.getLogger().warn('动态获取地址失败，降级使用固定地址', { error: e.message })
              return ['wlnimsc1.netease.im:443']
            }
          } else {
            // IM 未登录，直接使用固定地址
            nimSdk.getLogger().info('IM未登录，使用固定聊天室地址')
            return ['wlnimsc1.netease.im:443']
          }
        }
        
        // 3. 构建进入参数
        const enterParams = {
          accountId: accountId,
          token: token,
          linkProvider: linkProvider,
          anonymousMode: false
        }
        
        nimSdk.getLogger().info('步骤3: 调用 enter 方法...', {
          roomId,
          accountId,
          hasLinkProvider: true,
          anonymousMode: false
        })
        
        const result = await nimSdk.enterChatroom(roomId, enterParams)
        
        this.chatroomStatus = 'entered'
        nimSdk.getLogger().success('进入聊天室成功', {
          roomId: result.chatroom?.roomId,
          roomName: result.chatroom?.roomName
        })
        uni.showToast({ title: '进入聊天室成功', icon: 'success' })
        
      } catch (e) {
        this.chatroomStatus = 'exited'
        nimSdk.getLogger().error('进入聊天室失败', { code: e.code, message: e.message })
        uni.showToast({ title: '进入聊天室失败: ' + e.message, icon: 'none' })
      }
    },
    
    // 退出聊天室
    async handleExitChatroom() {
      try {
        await nimSdk.exitChatroom()
        await nimSdk.destroyChatroom()
        this.chatroomStatus = 'exited'
        uni.showToast({ title: '退出聊天室成功', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: '退出聊天室失败: ' + e.message, icon: 'none' })
      }
    },
    
    // 一键登录
    async handleOneClickLogin() {
      try {
        // 1. 初始化 SDK
        if (!nimSdk.isInitialized()) {
          nimSdk.getLogger().info('=== 一键登录开始 ===')
          nimSdk.getLogger().info('步骤1: 初始化SDK...')
          nimSdk.initNIM({
            appkey: this.initConfig.appkey,
            debugLevel: this.initConfig.debugLevel
          })
          uni.setStorageSync('nim_init_config', this.initConfig)
        }
        
        // 2. IM 登录
        if (nimSdk.getLoginStatus() !== 1) {
          nimSdk.getLogger().info('步骤2: 登录IM...')
          await nimSdk.login(this.loginConfig.accountId, this.loginConfig.token)
          this.imLoginStatus = 1
        }
        
        // 3. 进入聊天室
        nimSdk.getLogger().info('步骤3: 进入聊天室...')
        await this.handleEnterChatroom()
        
        nimSdk.getLogger().success('=== 一键登录完成 ===')
        
      } catch (e) {
        nimSdk.getLogger().error('一键登录失败', { message: e.message })
        uni.showToast({ title: '一键登录失败: ' + e.message, icon: 'none' })
      }
    },
    
    // 一键登出
    async handleOneClickLogout() {
      try {
        nimSdk.getLogger().info('=== 一键登出开始 ===')
        
        // 1. 退出聊天室
        if (nimSdk.isChatroomInitialized()) {
          nimSdk.getLogger().info('步骤1: 退出聊天室...')
          await nimSdk.exitChatroom()
          await nimSdk.destroyChatroom()
          this.chatroomStatus = 'exited'
        }
        
        // 2. IM 登出
        if (nimSdk.getLoginStatus() === 1) {
          nimSdk.getLogger().info('步骤2: 登出IM...')
          await nimSdk.logout()
          this.imLoginStatus = 0
        }
        
        nimSdk.getLogger().success('=== 一键登出完成 ===')
        uni.showToast({ title: '一键登出成功', icon: 'success' })
        
      } catch (e) {
        nimSdk.getLogger().error('一键登出失败', { message: e.message })
        uni.showToast({ title: '一键登出失败: ' + e.message, icon: 'none' })
      }
    },
    
    // 注册事件监听
    registerListeners() {
      nimSdk.registerLoginListeners({
        onLoginStatus: (s) => nimSdk.getLogger().info('IM登录状态变化', { status: s }),
        onKickedOffline: (d) => nimSdk.getLogger().warn('IM被踢下线', d),
        onConnectStatus: (s) => nimSdk.getLogger().info('IM连接状态变化', { status: s })
      })
      nimSdk.registerChatroomListeners({
        onChatroomStatus: (s) => nimSdk.getLogger().info('聊天室状态变化', { status: s }),
        onChatroomKicked: (d) => nimSdk.getLogger().warn('被踢出聊天室', d)
      })
      uni.showToast({ title: '已注册监听', icon: 'success' })
    },
    
    // 移除事件监听
    removeListeners() {
      nimSdk.removeLoginListeners()
      nimSdk.removeChatroomListeners()
      uni.showToast({ title: '已移除监听', icon: 'success' })
    }
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
.btn-group { display: flex; gap: 16rpx; margin-bottom: 20rpx; }
.btn-group .btn { flex: 1; margin-bottom: 0; }
.status-info { display: flex; align-items: center; padding: 16rpx; background: #f8f9fa; border-radius: 8rpx; }
.status-label { font-size: 26rpx; color: #666; margin-right: 16rpx; }
.status-tag { display: inline-block; padding: 6rpx 16rpx; border-radius: 20rpx; font-size: 22rpx; }
.status-online { background-color: #e8f5e9; color: #4caf50; }
.status-offline { background-color: #ffebee; color: #f44336; }
.btn-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
</style>
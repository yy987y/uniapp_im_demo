<template>
  <view class="card">
    <view class="card-title">服务模块</view>
    <view class="service-list">
      <view
        v-for="(service, index) in services"
        :key="index"
        class="service-item"
        :class="{ 'service-disabled': service.requireLogin && !isLoggedIn }"
        @click="navigateTo(service)"
      >
        <view class="service-name">{{ service.name }}</view>
        <view class="service-desc">{{ service.desc }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ServiceNavigator',
  props: {
    isLoggedIn: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      services: [
        { name: '登录服务', desc: 'SDK初始化 / 登录 / 登出 / 状态查询', path: '/pages/login/login', requireLogin: false }
        // 扩展点：新增服务模块只需在此追加一项
        // { name: '消息服务', desc: '发送/接收/撤回消息', path: '/pages/message/message', requireLogin: true },
        // { name: '会话服务', desc: '会话列表/置顶/删除', path: '/pages/conversation/conversation', requireLogin: true },
        // { name: '群组服务', desc: '创建群/管理成员/群设置', path: '/pages/team/team', requireLogin: true },
        // { name: '好友服务', desc: '添加/删除/黑名单', path: '/pages/friend/friend', requireLogin: true },
        // { name: '用户服务', desc: '资料查询/修改', path: '/pages/user/user', requireLogin: true },
        // { name: '设置服务', desc: '免打扰/推送配置', path: '/pages/setting/setting', requireLogin: true },
        // { name: '存储服务', desc: '文件上传/下载', path: '/pages/storage/storage', requireLogin: true },
        // { name: '信令服务', desc: '呼叫/接听/挂断', path: '/pages/signalling/signalling', requireLogin: true },
        // { name: 'AI服务', desc: 'AI会话/数字人', path: '/pages/ai/ai', requireLogin: true },
        // { name: '通知服务', desc: '自定义通知', path: '/pages/notification/notification', requireLogin: true },
      ]
    }
  },
  methods: {
    navigateTo(service) {
      if (service.requireLogin && !this.isLoggedIn) {
        uni.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      uni.navigateTo({ url: service.path })
    }
  }
}
</script>

<style scoped>
.card {
  background-color: #ffffff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}
.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 1px solid #eeeeee;
}
.service-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.service-item {
  display: flex;
  flex-direction: column;
  padding: 20rpx 24rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border: 1px solid #eee;
}
.service-item:active {
  background: #e8f4fd;
  border-color: #007AFF;
}
.service-disabled {
  opacity: 0.5;
}
.service-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}
.service-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
}
</style>

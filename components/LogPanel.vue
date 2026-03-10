<template>
  <view class="log-panel">
    <view class="log-header">
      <text class="log-title">执行日志</text>
      <view class="log-actions">
        <text class="action-btn" @click="copyLogs">复制</text>
        <text class="action-btn" @click="handleClear">清空</text>
      </view>
    </view>
    <scroll-view
      scroll-y
      :scroll-top="scrollTop"
      class="log-content"
      :style="{ height: height }"
    >
      <view v-if="displayLogs.length === 0" class="empty-log">
        <text>暂无日志</text>
      </view>
      <view v-else>
        <view
          v-for="(log, index) in displayLogs"
          :key="index"
          class="log-item"
          :class="'log-' + log.type"
        >
          <text class="log-time">[{{ log.time }}]</text>
          <text class="log-type">[{{ log.type.toUpperCase() }}]</text>
          <text class="log-message">{{ log.message }}</text>
          <view v-if="log.data" class="log-data">{{ log.data }}</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import store from '@/utils/store.js'
import logger from '@/utils/logger.js'

export default {
  name: 'LogPanel',
  props: {
    height: {
      type: String,
      default: '400rpx'
    },
    autoScroll: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      scrollTop: 0,
      displayLogs: []
    }
  },
  created() {
    this.displayLogs = [...store.logs]
    this._unsub = store.subscribe(() => {
      this.displayLogs = [...store.logs]
    })
  },
  beforeUnmount() {
    if (this._unsub) this._unsub()
  },
  watch: {
    displayLogs: {
      handler() {
        if (this.autoScroll) {
          this.$nextTick(() => {
            this.scrollTop = this.displayLogs.length * 100
          })
        }
      },
      deep: true
    }
  },
  methods: {
    handleClear() {
      logger.clear()
    },

    copyLogs() {
      const text = this.displayLogs.map(log => {
        let line = `[${log.time}] [${log.type.toUpperCase()}] ${log.message}`
        if (log.data) {
          line += '\n' + log.data
        }
        return line
      }).join('\n')

      uni.setClipboardData({
        data: text || '暂无日志',
        success: () => {
          uni.showToast({ title: '已复制', icon: 'success' })
        }
      })
    }
  }
}
</script>

<style scoped>
.log-panel {
  background-color: #1e1e1e;
  border-radius: 12rpx;
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 20rpx;
  background-color: #2d2d2d;
  border-bottom: 1px solid #404040;
}

.log-title {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
}

.log-actions {
  display: flex;
  gap: 20rpx;
}

.action-btn {
  font-size: 24rpx;
  color: #4fc3f7;
}

.log-content {
  padding: 16rpx;
}

.empty-log {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  color: #666666;
  font-size: 26rpx;
}

.log-item {
  margin-bottom: 12rpx;
  font-family: 'Courier New', monospace;
  font-size: 22rpx;
  line-height: 1.5;
}

.log-time {
  color: #888888;
  margin-right: 8rpx;
}

.log-type {
  margin-right: 8rpx;
}

.log-message {
  word-break: break-all;
}

.log-data {
  margin-top: 8rpx;
  padding: 12rpx;
  background-color: #2d2d2d;
  border-radius: 6rpx;
  white-space: pre-wrap;
  word-break: break-all;
  color: #cccccc;
  font-size: 20rpx;
}

.log-info .log-type,
.log-info .log-message {
  color: #4fc3f7;
}

.log-success .log-type,
.log-success .log-message {
  color: #81c784;
}

.log-error .log-type,
.log-error .log-message {
  color: #e57373;
}

.log-warn .log-type,
.log-warn .log-message {
  color: #ffb74d;
}
</style>

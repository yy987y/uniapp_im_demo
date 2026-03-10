<template>
  <view class="api-tester">
    <view class="api-header" @click="toggleExpand">
      <view class="api-name">{{ apiName }}</view>
      <view class="api-toggle">{{ isExpanded ? '收起' : '展开' }}</view>
    </view>
    
    <view v-if="isExpanded" class="api-body">
      <!-- 参数输入区域 -->
      <view v-if="params && params.length > 0" class="params-section">
        <view class="section-title">参数配置</view>
        <view v-for="(param, index) in params" :key="index" class="param-item">
          <view class="param-label">
            {{ param.name }}
            <text v-if="param.required" class="required">*</text>
            <text class="param-type">({{ param.type }})</text>
          </view>
          <view v-if="param.type === 'boolean'" class="param-input">
            <switch 
              :checked="paramValues[param.name]" 
              @change="(e) => updateParam(param.name, e.detail.value)"
            />
          </view>
          <view v-else-if="param.type === 'select'" class="param-input">
            <picker 
              :range="param.options" 
              :range-key="'label'"
              @change="(e) => updateParam(param.name, param.options[e.detail.value].value)"
            >
              <view class="picker-text">
                {{ getSelectedLabel(param) || '请选择' }}
              </view>
            </picker>
          </view>
          <view v-else-if="param.type === 'object' || param.type === 'array'" class="param-input">
            <textarea 
              class="textarea-field"
              :value="paramValues[param.name]"
              :placeholder="param.placeholder || `请输入${param.type === 'object' ? 'JSON对象' : 'JSON数组'}`"
              @input="(e) => updateParam(param.name, e.detail.value)"
            />
          </view>
          <view v-else class="param-input">
            <input 
              class="input-field"
              :type="param.type === 'number' ? 'number' : 'text'"
              :value="paramValues[param.name]"
              :placeholder="param.placeholder || `请输入${param.name}`"
              @input="(e) => updateParam(param.name, e.detail.value)"
            />
          </view>
          <view v-if="param.description" class="param-desc">{{ param.description }}</view>
        </view>
      </view>
      
      <!-- 执行按钮 -->
      <view class="action-section">
        <view class="btn" :class="{ 'btn-disabled': loading }" @click="executeApi">
          {{ loading ? '执行中...' : '执行' }}
        </view>
        <view class="btn btn-secondary" @click="resetParams">重置参数</view>
      </view>
      
      <!-- 结果展示区域 -->
      <view v-if="result !== null" class="result-section">
        <view class="section-title flex-row flex-between">
          <text>执行结果</text>
          <text class="copy-btn" @click="copyResult">复制</text>
        </view>
        <scroll-view scroll-y class="result-content">
          <text :class="resultClass">{{ formattedResult }}</text>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ApiTester',
  props: {
    // API 名称
    apiName: {
      type: String,
      required: true
    },
    // API 描述
    description: {
      type: String,
      default: ''
    },
    // 参数配置
    // 格式: [{ name: 'paramName', type: 'string|number|boolean|object|array|select', required: true, default: '', options: [], placeholder: '', description: '' }]
    params: {
      type: Array,
      default: () => []
    },
    // API 执行函数
    apiFunction: {
      type: Function,
      required: true
    },
    // 默认展开
    defaultExpanded: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isExpanded: this.defaultExpanded,
      paramValues: {},
      loading: false,
      result: null,
      isError: false
    }
  },
  computed: {
    formattedResult() {
      if (this.result === null) return ''
      if (typeof this.result === 'object') {
        return JSON.stringify(this.result, null, 2)
      }
      return String(this.result)
    },
    resultClass() {
      return this.isError ? 'result-error' : 'result-success'
    }
  },
  created() {
    this.initParams()
  },
  methods: {
    initParams() {
      const values = {}
      this.params.forEach(param => {
        if (param.default !== undefined) {
          values[param.name] = param.default
        } else if (param.type === 'boolean') {
          values[param.name] = false
        } else if (param.type === 'object') {
          values[param.name] = '{}'
        } else if (param.type === 'array') {
          values[param.name] = '[]'
        } else {
          values[param.name] = ''
        }
      })
      // 参数持久化：尝试从本地缓存回填上次使用的参数值
      const cacheKey = 'api_params_' + this.apiName
      try {
        const saved = uni.getStorageSync(cacheKey)
        if (saved) {
          const cached = JSON.parse(saved)
          Object.keys(cached).forEach(key => {
            if (key in values) {
              values[key] = cached[key]
            }
          })
        }
      } catch (e) {
        // 缓存读取失败不影响功能
      }
      this.paramValues = values
    },
    
    toggleExpand() {
      this.isExpanded = !this.isExpanded
    },
    
    updateParam(name, value) {
      this.paramValues[name] = value
    },
    
    getSelectedLabel(param) {
      const value = this.paramValues[param.name]
      const option = param.options?.find(opt => opt.value === value)
      return option?.label || ''
    },
    
    resetParams() {
      this.initParams()
      this.result = null
      this.isError = false
    },
    
    async executeApi() {
      if (this.loading) return
      
      // 验证必填参数
      for (const param of this.params) {
        if (param.required && !this.paramValues[param.name] && this.paramValues[param.name] !== 0 && this.paramValues[param.name] !== false) {
          uni.showToast({
            title: `请输入${param.name}`,
            icon: 'none'
          })
          return
        }
      }
      
      this.loading = true
      this.result = null
      this.isError = false
      
      try {
        // 处理参数
        const processedParams = {}
        for (const param of this.params) {
          let value = this.paramValues[param.name]
          
          // 类型转换
          if (param.type === 'number' && value !== '') {
            value = Number(value)
          } else if ((param.type === 'object' || param.type === 'array') && typeof value === 'string') {
            try {
              value = JSON.parse(value)
            } catch (e) {
              throw new Error(`参数 ${param.name} 不是有效的 JSON 格式`)
            }
          }
          
          processedParams[param.name] = value
        }
        
        const result = await this.apiFunction(processedParams)
        this.result = result !== undefined ? result : { success: true, message: '执行成功' }
        this.isError = false
        
        // 执行成功后持久化参数，下次自动回填
        try {
          const cacheKey = 'api_params_' + this.apiName
          uni.setStorageSync(cacheKey, JSON.stringify(this.paramValues))
        } catch (e) {
          // 持久化失败不影响功能
        }
        
        this.$emit('success', { api: this.apiName, params: processedParams, result: this.result })
      } catch (error) {
        this.result = {
          error: true,
          code: error.code || 'UNKNOWN',
          message: error.message || String(error),
          detail: error.detail || null
        }
        this.isError = true
        
        this.$emit('error', { api: this.apiName, error })
      } finally {
        this.loading = false
      }
    },
    
    copyResult() {
      uni.setClipboardData({
        data: this.formattedResult,
        success: () => {
          uni.showToast({
            title: '已复制',
            icon: 'success'
          })
        }
      })
    }
  }
}
</script>

<style scoped>
.api-tester {
  background-color: #ffffff;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.api-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eeeeee;
}

.api-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.api-toggle {
  font-size: 26rpx;
  color: #007AFF;
}

.api-body {
  padding: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 1px solid #eeeeee;
}

.params-section {
  margin-bottom: 24rpx;
}

.param-item {
  margin-bottom: 20rpx;
}

.param-label {
  font-size: 26rpx;
  color: #333333;
  margin-bottom: 8rpx;
}

.required {
  color: #ff3b30;
  margin-left: 4rpx;
}

.param-type {
  color: #999999;
  font-size: 22rpx;
  margin-left: 8rpx;
}

.param-input {
  margin-top: 8rpx;
}

.param-desc {
  font-size: 22rpx;
  color: #999999;
  margin-top: 8rpx;
}

.input-field {
  width: 100%;
  height: 70rpx;
  border: 1px solid #e0e0e0;
  border-radius: 6rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.textarea-field {
  width: 100%;
  min-height: 150rpx;
  border: 1px solid #e0e0e0;
  border-radius: 6rpx;
  padding: 20rpx;
  font-size: 26rpx;
  box-sizing: border-box;
  font-family: 'Courier New', monospace;
}

.picker-text {
  height: 70rpx;
  line-height: 70rpx;
  border: 1px solid #e0e0e0;
  border-radius: 6rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333333;
  background-color: #ffffff;
}

.action-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.action-section .btn {
  flex: 1;
}

.result-section {
  margin-top: 20rpx;
}

.copy-btn {
  font-size: 24rpx;
  color: #007AFF;
  font-weight: normal;
}

.result-content {
  background-color: #1e1e1e;
  border-radius: 8rpx;
  padding: 20rpx;
  max-height: 400rpx;
}

.result-content text {
  font-size: 24rpx;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

.result-success {
  color: #81c784;
}

.result-error {
  color: #e57373;
}

.flex-row {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.flex-between {
  justify-content: space-between;
}
</style>

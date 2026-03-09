# Components

## ApiTester.vue

Reusable API test card component with parameter form and result display.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| apiName | String | Yes | API method name |
| params | Array | No | Parameter configurations |
| apiFunction | Function | Yes | Async function to execute |
| defaultExpanded | Boolean | No | Start expanded |

### Parameter Configuration

```javascript
params: [
  {
    name: 'accountId',      // Parameter name
    type: 'string',         // string|number|boolean|select|object|array
    required: true,         // Required field
    default: '',            // Default value
    placeholder: '账号ID',   // Input placeholder
    description: '用户账号',  // Help text
    options: []             // For select type: [{label, value}]
  }
]
```

### Type Mappings

| type | Component | Notes |
|------|-----------|-------|
| string | input | Text input |
| number | input[number] | Number input |
| boolean | switch | Toggle |
| select | picker | Dropdown, requires options |
| object | textarea | JSON object input |
| array | textarea | JSON array input |

### Template

```vue
<template>
  <view class="api-tester">
    <view class="api-header" @click="toggleExpand">
      <text class="api-name">{{ apiName }}</text>
      <text class="api-toggle">{{ isExpanded ? '收起' : '展开' }}</text>
    </view>
    
    <view v-if="isExpanded" class="api-body">
      <!-- Parameter inputs -->
      <view v-for="param in params" :key="param.name" class="param-item">
        <text class="param-label">{{ param.name }}</text>
        
        <switch v-if="param.type === 'boolean'" 
          :checked="paramValues[param.name]"
          @change="e => updateParam(param.name, e.detail.value)" />
        
        <picker v-else-if="param.type === 'select'"
          :range="param.options" range-key="label"
          @change="e => updateParam(param.name, param.options[e.detail.value].value)">
          <view class="picker-text">{{ getSelectedLabel(param) }}</view>
        </picker>
        
        <textarea v-else-if="param.type === 'object' || param.type === 'array'"
          :value="paramValues[param.name]"
          :placeholder="param.placeholder"
          @input="e => updateParam(param.name, e.detail.value)" />
        
        <input v-else
          :type="param.type === 'number' ? 'number' : 'text'"
          :value="paramValues[param.name]"
          :placeholder="param.placeholder"
          @input="e => updateParam(param.name, e.detail.value)" />
      </view>
      
      <!-- Execute button -->
      <view class="btn" @click="executeApi">{{ loading ? '执行中...' : '执行' }}</view>
      
      <!-- Result display -->
      <view v-if="result !== null" class="result-section">
        <text :class="isError ? 'result-error' : 'result-success'">
          {{ JSON.stringify(result, null, 2) }}
        </text>
      </view>
    </view>
  </view>
</template>
```

### Script

```javascript
export default {
  props: {
    apiName: { type: String, required: true },
    params: { type: Array, default: () => [] },
    apiFunction: { type: Function, required: true },
    defaultExpanded: { type: Boolean, default: false }
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
  created() { this.initParams() },
  methods: {
    initParams() {
      const values = {}
      this.params.forEach(p => {
        values[p.name] = p.default !== undefined ? p.default :
          p.type === 'boolean' ? false :
          p.type === 'object' ? '{}' :
          p.type === 'array' ? '[]' : ''
      })
      this.paramValues = values
    },
    toggleExpand() { this.isExpanded = !this.isExpanded },
    updateParam(name, value) { this.paramValues[name] = value },
    getSelectedLabel(param) {
      const opt = param.options?.find(o => o.value === this.paramValues[param.name])
      return opt?.label || '请选择'
    },
    async executeApi() {
      if (this.loading) return
      
      // Validate required params
      for (const p of this.params) {
        if (p.required && !this.paramValues[p.name]) {
          uni.showToast({ title: `请输入${p.name}`, icon: 'none' })
          return
        }
      }
      
      this.loading = true
      this.result = null
      
      try {
        // Process params
        const processed = {}
        for (const p of this.params) {
          let val = this.paramValues[p.name]
          if (p.type === 'number' && val !== '') val = Number(val)
          if ((p.type === 'object' || p.type === 'array') && typeof val === 'string') {
            val = JSON.parse(val)
          }
          processed[p.name] = val
        }
        
        this.result = await this.apiFunction(processed) || { success: true }
        this.isError = false
      } catch (e) {
        this.result = { error: true, code: e.code, message: e.message }
        this.isError = true
      } finally {
        this.loading = false
      }
    }
  }
}
```

## LogPanel.vue

Real-time log display component.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| logs | Array | [] | Log entries |
| height | String | '400rpx' | Panel height |
| autoScroll | Boolean | true | Auto scroll to bottom |

### Log Entry Format

```javascript
{
  time: '15:30:45',
  type: 'info',    // info|success|warn|error
  message: 'Login success',
  data: '{"accountId":"test"}'  // Optional JSON string
}
```

### Template

```vue
<template>
  <view class="log-panel">
    <view class="log-header">
      <text>执行日志</text>
      <view class="log-actions">
        <text @click="copyLogs">复制</text>
        <text @click="$emit('clear')">清空</text>
      </view>
    </view>
    <scroll-view scroll-y :style="{ height }" :scroll-top="scrollTop">
      <view v-for="(log, i) in logs" :key="i" :class="'log-' + log.type">
        <text class="log-time">[{{ log.time }}]</text>
        <text class="log-type">[{{ log.type.toUpperCase() }}]</text>
        <text>{{ log.message }}</text>
        <view v-if="log.data" class="log-data">{{ log.data }}</view>
      </view>
    </scroll-view>
  </view>
</template>
```

### Styles

```css
.log-panel { background: #1e1e1e; border-radius: 12rpx; }
.log-header { display: flex; justify-content: space-between; padding: 16rpx; background: #2d2d2d; color: #fff; }
.log-info { color: #4fc3f7; }
.log-success { color: #81c784; }
.log-warn { color: #ffb74d; }
.log-error { color: #e57373; }
.log-time { color: #888; margin-right: 8rpx; }
.log-data { background: #2d2d2d; padding: 12rpx; margin-top: 8rpx; font-size: 20rpx; }
```

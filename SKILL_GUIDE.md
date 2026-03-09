# 网易云信 UniApp IM SDK 测试工具开发指南

## Skill 元信息

- **名称**: netease-nim-uniapp-sdk-tester
- **版本**: 1.0.0
- **适用场景**: 基于网易云信 IM SDK (nim-web-sdk-ng) 开发 UniApp 测试工具
- **SDK版本**: nim-web-sdk-ng >= 10.x
- **框架**: UniApp + Vue 3

---

## 1. SDK 引入方式

### ✅ 正确写法（V2 API）

```javascript
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK'
```

### ❌ 错误写法

```javascript
// 错误！这是 V1 API 路径
import V2NIM from 'nim-web-sdk-ng/dist/v1/NIM_UNIAPP_SDK'
```

### 注意事项

1. **V2 API 使用 `/dist/v2/` 路径**，不是 `/dist/v1/`
2. 导入名称建议使用 `NIM`，而不是 `V2NIM`
3. 安装命令：`npm install nim-web-sdk-ng@">=10"`

---

## 2. UniApp 项目必需文件

### 必须存在的文件列表

| 文件 | 说明 | 缺失后果 |
|------|------|----------|
| `index.html` | H5 入口模板 | HBuilderX 运行到浏览器时报错 |
| `manifest.json` | 应用配置 | 项目无法识别 |
| `pages.json` | 页面路由配置 | 页面无法加载 |
| `main.js` | 应用入口 | 应用无法启动 |
| `App.vue` | 根组件 | 应用无法渲染 |
| `uni.scss` | 全局样式变量 | 可选但建议创建 |

### index.html 模板

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
    <title>云信IM SDK测试工具</title>
    <!--preload-links-->
    <!--app-context-->
  </head>
  <body>
    <div id="app"><!--app-html--></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

### main.js (Vue 3 版本)

```javascript
import App from './App.vue'
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
```

---

## 3. SDK 初始化与使用

### 初始化代码

```javascript
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK'

const nim = NIM.getInstance({
  appkey: 'your-appkey',
  debugLevel: 'debug'  // 可选: 'off' | 'debug' | 'log' | 'warn' | 'error'
})
```

### 登录

```javascript
await nim.V2NIMLoginService.login(accountId, token, {
  forceMode: false,  // 是否强制登录（踢掉其他端）
  authType: 0        // 0: 静态Token, 1: 动态Token, 2: 第三方鉴权
})
```

### 服务访问方式

所有 V2 服务都通过 `nim.V2NIM[ServiceName]` 访问：

```javascript
nim.V2NIMLoginService        // 登录服务
nim.V2NIMMessageService      // 消息服务
nim.V2NIMConversationService // 会话服务
nim.V2NIMTeamService         // 群组服务
nim.V2NIMFriendService       // 好友服务
nim.V2NIMUserService         // 用户服务
nim.V2NIMSettingService      // 设置服务
nim.V2NIMStorageService      // 存储服务
nim.V2NIMSignallingService   // 信令服务
nim.V2NIMAIService           // AI服务
nim.V2NIMNotificationService // 通知服务
```

---

## 4. 项目结构规范

```
uniapp_im_demo/
├── index.html              # H5 入口模板（必需）
├── manifest.json           # 应用配置（必需）
├── pages.json              # 页面路由（必需）
├── main.js                 # 应用入口（必需）
├── App.vue                 # 根组件（必需）
├── uni.scss                # 全局样式变量
├── components/             # 通用组件
│   ├── ApiTester.vue      # API 测试组件
│   └── LogPanel.vue       # 日志面板组件
├── pages/                  # 页面目录
│   ├── index/index.vue    # 首页
│   ├── login/login.vue    # 登录服务页
│   ├── message/message.vue
│   ├── conversation/conversation.vue
│   ├── team/team.vue
│   ├── friend/friend.vue
│   ├── user/user.vue
│   ├── setting/setting.vue
│   ├── storage/storage.vue
│   ├── signalling/signalling.vue
│   ├── ai/ai.vue
│   └── notification/notification.vue
├── utils/
│   └── nim-sdk.js         # SDK 封装
├── static/                 # 静态资源
└── package.json
```

---

## 5. 常见错误与解决方案

### 错误 1: SDK 导入路径错误

**现象**: `Module not found` 或 SDK 方法不存在

**原因**: 使用了 V1 路径导入 V2 SDK

**解决**: 
```javascript
// 改为正确的 V2 路径
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK'
```

### 错误 2: 缺少 index.html

**现象**: HBuilderX 运行到 Chrome 时提示"根目录缺少 index.html"

**解决**: 在项目根目录创建 `index.html` 文件（见上方模板）

### 错误 3: main.js 格式错误

**现象**: 应用无法启动或白屏

**原因**: Vue 3 UniApp 的 main.js 格式与普通 Vue 项目不同

**正确格式**:
```javascript
import App from './App.vue'
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
  return { app }
}
```

### 错误 4: SDK 未初始化就调用服务

**现象**: `Cannot read property 'V2NIMLoginService' of null`

**解决**: 确保先调用 `NIM.getInstance()` 初始化后再使用服务

---

## 6. 测试工具设计模式

### ApiTester 组件设计

每个 SDK 接口对应一个可折叠的测试卡片，包含：

1. **参数配置区**: 根据接口参数动态生成表单
2. **执行按钮**: 调用对应的 SDK 方法
3. **结果展示区**: JSON 格式显示返回结果

### 参数类型映射

| 参数类型 | UI 组件 |
|---------|---------|
| string | input 输入框 |
| number | input[type=number] |
| boolean | switch 开关 |
| select | picker 选择器 |
| object | textarea (JSON) |
| array | textarea (JSON) |

### 日志系统设计

```javascript
const logger = {
  info(message, data) { /* 蓝色 */ },
  success(message, data) { /* 绿色 */ },
  warn(message, data) { /* 橙色 */ },
  error(message, data) { /* 红色 */ }
}
```

---

## 7. V2 API 接口速查

### V2NIMLoginService

| 方法 | 说明 | 参数 |
|------|------|------|
| login | 登录 | accountId, token, loginOption |
| logout | 登出 | - |
| getLoginUser | 获取当前登录用户 | - |
| getLoginStatus | 获取登录状态 | - |
| getConnectStatus | 获取连接状态 | - |
| getLoginClients | 获取多端登录列表 | - |
| kickOffline | 踢出其他端 | client |

### V2NIMMessageService

| 方法 | 说明 |
|------|------|
| sendMessage | 发送消息 |
| replyMessage | 回复消息 |
| revokeMessage | 撤回消息 |
| deleteMessage | 删除消息 |
| getMessageList | 获取消息列表 |
| pinMessage | Pin 消息 |
| addQuickComment | 添加快捷评论 |

### V2NIMConversationService

| 方法 | 说明 |
|------|------|
| getConversationList | 获取会话列表 |
| getConversation | 获取单个会话 |
| createConversation | 创建会话 |
| deleteConversation | 删除会话 |
| stickTopConversation | 置顶会话 |
| getTotalUnreadCount | 获取总未读数 |
| clearTotalUnreadCount | 清除总未读数 |

---

## 8. 开发检查清单

开发前请确认：

- [ ] 安装 SDK: `npm install nim-web-sdk-ng@">=10"`
- [ ] 使用正确的导入路径: `nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK`
- [ ] 创建 `index.html` 文件
- [ ] `main.js` 使用 `createSSRApp` 格式
- [ ] `manifest.json` 配置 `"vueVersion": "3"`
- [ ] 从云信控制台获取有效的 AppKey
- [ ] 准备测试账号和 Token

---

## 9. 参考资源

- 云信 IM 官方文档: https://doc.yunxin.163.com/messaging/docs/home-page
- nim-web-sdk-ng NPM: https://www.npmjs.com/package/nim-web-sdk-ng
- UniApp 官方文档: https://uniapp.dcloud.net.cn/

---

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2026-03-05 | 1.0.0 | 初始版本，包含 V2 API 主要服务接口 |

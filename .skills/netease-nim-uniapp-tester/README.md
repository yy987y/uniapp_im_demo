# Netease NIM UniApp Tester Skill

网易云信 IM SDK (nim-web-sdk-ng) UniApp 测试工具构建器。

## 安装方法

### 方法 1：解压安装

```bash
unzip netease-nim-uniapp-tester.skill -d ~/.claude/skills/
```

### 方法 2：手动复制

将 `netease-nim-uniapp-tester` 文件夹复制到 `~/.claude/skills/` 目录下。

## 使用方法

在 Claude 对话中使用以下触发词：

- "帮我创建云信测试工具"
- "创建网易云信 SDK 测试项目"
- "nim-web-sdk-ng 测试工具"
- "云信 IM 接口测试"
- "IM SDK UniApp 测试"

Claude 会自动加载此 Skill 并引导您创建完整的测试工具项目。

## Skill 内容

| 文件 | 说明 |
|------|------|
| `SKILL.md` | 主指令文件，包含触发条件和核心规则 |
| `references/sdk-wrapper.md` | SDK 封装代码模板 |
| `references/components.md` | ApiTester/LogPanel 组件模板 |
| `references/v2-api-list.md` | V2 API 完整接口清单 |
| `references/project-structure.md` | 项目结构和页面模板 |

## ⚠️ 重要注意事项

### 1. SDK 导入路径

```javascript
// ✅ 正确 - V2 API 路径
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK'

// ❌ 错误 - V1 路径，不要使用
import V2NIM from 'nim-web-sdk-ng/dist/v1/NIM_UNIAPP_SDK'
```

**这是最常见的错误**：V2 API 必须使用 `/dist/v2/` 路径，而不是 `/dist/v1/`。

### 2. UniApp 必需文件

**必须在项目根目录创建 `index.html`**，否则 HBuilderX 运行到浏览器会报错：

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

### 3. main.js 格式 (Vue 3)

```javascript
import App from './App.vue'
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
  return { app }
}
```

### 4. manifest.json 配置

```json
{
  "vueVersion": "3"
}
```

## 常见错误排查

| 错误现象 | 原因 | 解决方案 |
|---------|------|----------|
| `Module not found` | SDK 路径错误 | 使用 `/dist/v2/NIM_UNIAPP_SDK` |
| "根目录缺少 index.html" | 未创建 H5 入口 | 在根目录创建 index.html |
| 应用白屏 | main.js 格式错误 | 使用 createSSRApp 格式 |
| `V2NIMLoginService` 为 null | SDK 未初始化 | 先调用 `NIM.getInstance()` |
| 登录失败 | Token 无效 | 检查云信控制台账号配置 |

## 开发检查清单

创建项目前请确认：

- [ ] 运行 `npm install nim-web-sdk-ng@">=10"`
- [ ] SDK 导入使用 `nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK`
- [ ] 根目录存在 `index.html` 文件
- [ ] `manifest.json` 包含 `"vueVersion": "3"`
- [ ] `main.js` 使用 `createSSRApp` 导出格式
- [ ] 所有页面路径与 `pages.json` 配置一致

## 支持的 V2 API 服务

- V2NIMLoginService - 登录服务
- V2NIMMessageService - 消息服务
- V2NIMConversationService - 会话服务
- V2NIMTeamService - 群组服务
- V2NIMFriendService - 好友服务
- V2NIMUserService - 用户服务
- V2NIMSettingService - 设置服务
- V2NIMStorageService - 存储服务
- V2NIMSignallingService - 信令服务
- V2NIMAIService - AI服务
- V2NIMNotificationService - 通知服务

## 版本信息

- Skill 版本: 1.0.0
- 适用 SDK: nim-web-sdk-ng >= 10.x
- 框架: UniApp + Vue 3

## 许可

MIT License

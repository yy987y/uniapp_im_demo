---
name: netease-nim-uniapp-tester
description: |
  Create UniApp test tools for Netease Yunxin IM SDK (nim-web-sdk-ng).
  Use when users need to: (1) Build SDK test/debug tools for Netease IM,
  (2) Create UniApp projects that test nim-web-sdk-ng V2 APIs,
  (3) Debug or reproduce IM SDK issues with customizable parameters,
  (4) Generate API testing interfaces for login, message, conversation, team, friend services.
  Triggers: "云信测试工具", "网易云信SDK测试", "nim-web-sdk-ng测试", "IM SDK UniApp测试", "云信IM接口测试"
---

# Netease Yunxin IM SDK UniApp Test Tool Builder

Build UniApp test tools for nim-web-sdk-ng V2 API with configurable parameters and real-time logging.

## Critical Rules

### SDK Import Path

```javascript
// ✅ CORRECT - V2 API path
import NIM from 'nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK'

// ❌ WRONG - This is V1 path, DO NOT USE
import V2NIM from 'nim-web-sdk-ng/dist/v1/NIM_UNIAPP_SDK'
```

### Required Files

Create `index.html` in project root (HBuilderX H5 requirement):

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

### main.js Format (Vue 3 UniApp)

```javascript
import App from './App.vue'
import { createSSRApp } from 'vue'

export function createApp() {
  const app = createSSRApp(App)
  return { app }
}
```

## Workflow

1. Run `npm install nim-web-sdk-ng@">=10"`
2. Create project structure per [references/project-structure.md](references/project-structure.md)
3. Copy SDK wrapper from [references/sdk-wrapper.md](references/sdk-wrapper.md)
4. Create ApiTester component from [references/components.md](references/components.md)
5. Build service pages using [references/v2-api-list.md](references/v2-api-list.md)

## Project Structure

```
project/
├── index.html              # H5 entry (REQUIRED)
├── manifest.json           # App config (vueVersion: "3")
├── pages.json              # Page routes
├── main.js                 # Vue 3 entry
├── App.vue                 # Root component
├── components/
│   ├── ApiTester.vue       # API test component
│   └── LogPanel.vue        # Log display
├── pages/
│   ├── index/index.vue     # Home navigation
│   ├── login/login.vue     # V2NIMLoginService
│   ├── message/message.vue # V2NIMMessageService
│   ├── conversation/       # V2NIMConversationService
│   ├── team/team.vue       # V2NIMTeamService
│   ├── friend/friend.vue   # V2NIMFriendService
│   ├── user/user.vue       # V2NIMUserService
│   ├── setting/setting.vue # V2NIMSettingService
│   ├── storage/storage.vue # V2NIMStorageService
│   ├── signalling/         # V2NIMSignallingService
│   ├── ai/ai.vue           # V2NIMAIService
│   └── notification/       # V2NIMNotificationService
└── utils/nim-sdk.js        # SDK wrapper
```

## Error Prevention

| Error | Cause | Fix |
|-------|-------|-----|
| Module not found | Wrong SDK path | Use `/dist/v2/NIM_UNIAPP_SDK` |
| Missing index.html | No H5 entry | Create index.html in root |
| White screen | Bad main.js | Use createSSRApp format |
| V2NIMLoginService null | SDK not init | Call NIM.getInstance() first |

## Pre-flight Checklist

- [ ] `npm install nim-web-sdk-ng@">=10"`
- [ ] SDK import: `nim-web-sdk-ng/dist/v2/NIM_UNIAPP_SDK`
- [ ] `index.html` exists in root
- [ ] `manifest.json` has `"vueVersion": "3"`
- [ ] `main.js` exports createSSRApp format
- [ ] All page paths match pages.json

## User Confirmation

Ask before building:
1. Platform: H5 / WeChat Mini Program / APP
2. Framework: Vue 3 (recommended) / Vue 2
3. API version: V2 (recommended) / V1 / Both
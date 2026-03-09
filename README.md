# 网易云信 IM SDK 测试工具

基于 UniApp + Vue3 开发的网易云信 IM SDK (nim-web-sdk-ng) 接口测试工具。

## 功能特点

- ✅ 支持 V2 API 全部主要接口测试
- ✅ 每个接口支持自定义参数输入
- ✅ 实时查看执行结果和日志
- ✅ 支持多端运行（H5、微信小程序、APP）
- ✅ 参数配置本地缓存

## 覆盖的服务模块

| 模块 | 说明 | 接口数量 |
|------|------|----------|
| V2NIMLoginService | 登录服务 | 12+ |
| V2NIMMessageService | 消息服务 | 25+ |
| V2NIMConversationService | 会话服务 | 20+ |
| V2NIMTeamService | 群组服务 | 30+ |
| V2NIMFriendService | 好友服务 | 15+ |
| V2NIMUserService | 用户服务 | 10+ |
| V2NIMSettingService | 设置服务 | 8+ |
| V2NIMStorageService | 存储服务 | 6+ |
| V2NIMSignallingService | 信令服务 | 15+ |
| V2NIMAIService | AI服务 | 8+ |
| V2NIMNotificationService | 通知服务 | 5+ |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 使用 HBuilderX 打开项目

1. 打开 HBuilderX
2. 文件 -> 导入 -> 从本地目录导入
3. 选择本项目目录

### 3. 运行项目

- **H5**: 运行 -> 运行到浏览器 -> Chrome
- **小程序**: 运行 -> 运行到小程序模拟器 -> 微信开发者工具
- **APP**: 运行 -> 运行到手机或模拟器

### 4. 配置并使用

1. 在首页点击「初始化/登录」进入登录页面
2. 输入 AppKey 并点击「初始化 SDK」
3. 输入账号和 Token，点击「执行」登录
4. 登录成功后，可以访问其他服务模块进行接口测试

## SDK 版本

- nim-web-sdk-ng: >=10.x

## 项目结构

```
├── components/          # 通用组件
│   ├── ApiTester.vue   # API 测试组件
│   └── LogPanel.vue    # 日志面板组件
├── pages/              # 页面
│   ├── index/          # 首页
│   ├── login/          # 登录服务
│   ├── message/        # 消息服务
│   ├── conversation/   # 会话服务
│   ├── team/           # 群组服务
│   ├── friend/         # 好友服务
│   ├── user/           # 用户服务
│   ├── setting/        # 设置服务
│   ├── storage/        # 存储服务
│   ├── signalling/     # 信令服务
│   ├── ai/             # AI服务
│   └── notification/   # 通知服务
├── utils/
│   └── nim-sdk.js      # SDK 封装
├── App.vue             # 应用入口
├── main.js             # 主入口
├── manifest.json       # 应用配置
├── pages.json          # 页面配置
└── package.json        # 依赖配置
```

## 使用说明

### ApiTester 组件

每个 API 测试卡片包含：
- **参数配置区**: 根据接口定义动态生成输入表单
- **执行按钮**: 点击执行对应的 SDK 接口
- **结果展示区**: 显示接口返回结果或错误信息

### 参数类型支持

- `string`: 文本输入框
- `number`: 数字输入框
- `boolean`: 开关组件
- `select`: 下拉选择器
- `object`: JSON 对象输入框
- `array`: JSON 数组输入框

### 日志面板

- 实时显示 SDK 操作日志
- 支持复制和清空
- 按日志级别着色（info/success/warn/error）

## 注意事项

1. 使用前请确保已在网易云信控制台创建应用并获取 AppKey
2. 登录需要有效的账号和 Token（可在控制台创建测试账号）
3. 部分接口需要登录后才能调用
4. 私有化部署需要配置自定义 LBS 和 Link 地址

## License

MIT

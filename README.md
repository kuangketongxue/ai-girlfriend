# AI女友 — 微信ClawBot + SenseNova

> 一个独立的AI女友角色扮演，通过微信直接聊天。

## 架构

```
微信用户 → 微信ClawBot插件 → 本服务器 → SenseNova API
                                    ↓
                              对话记忆（本地）
```

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动服务
```bash
npm start
```

### 3. 配置微信ClawBot
1. 微信更新到最新版本
2. 启用ClawBot插件（设置 → 插件 → ClawBot）
3. 扫码绑定
4. 配置Webhook URL指向你的服务器

### 4. 测试
打开微信，给绑定的账号发消息，AI女友会自动回复。

## 自定义角色

编辑 `character.js` 修改：
- 名字、年龄、性格
- 说话风格（问候/撒娇/关心/告别）
- 系统提示词

## 项目结构

```
ai-girlfriend/
├── server.js        # 主服务器（API路由+SenseNova调用）
├── character.js     # 角色定义（性格/说话风格/系统提示词）
├── memory.js        # 对话记忆（本地JSON存储）
├── data/            # 对话记录存储
├── package.json
└── README.md
```

## 技术栈

- Node.js + Express
- SenseNova API（商汤大模型）
- 微信ClawBot（腾讯官方API）
- 本地JSON记忆存储

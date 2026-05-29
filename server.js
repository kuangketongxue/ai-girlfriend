// 服务器主文件 — AI女友 + SenseNova + 微信ClawBot
const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const CHARACTER = require('./character');
const { getHistory, addMessage } = require('./memory');

const app = express();
app.use(express.json());

// ========== 配置 ==========
const CONFIG = {
    senseNova: {
        baseUrl: 'https://token.sensenova.cn/v1',
        apiKey: 'sk-QOuHxGe76hjcC98McvuaYrRoAvwyiXaN',
        model: 'sensenova-6.7-flash-lite'
    },
    port: process.env.PORT || 3000
};

// ========== SenseNova API 调用 ==========
async function chatWithAI(userId, userMessage) {
    const history = getHistory(userId);

    // 构建消息列表
    const messages = [
        { role: 'system', content: CHARACTER.systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: userMessage }
    ];

    try {
        const response = await axios.post(
            `${CONFIG.senseNova.baseUrl}/chat/completions`,
            {
                model: CONFIG.senseNova.model,
                messages: messages,
                temperature: 0.8,
                max_tokens: 500
            },
            {
                headers: {
                    'Authorization': `Bearer ${CONFIG.senseNova.apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const reply = response.data.choices[0].message.content;

        // 保存对话历史
        addMessage(userId, 'user', userMessage);
        addMessage(userId, 'assistant', reply);

        return reply;
    } catch (error) {
        console.error('SenseNova API error:', error.message);
        return '嗯...我现在有点累，等一下再聊好吗~';
    }
}

// ========== 微信 ClawBot 回调 ==========
// ClawBot 通过 POST /webhook 推送消息给我们
app.post('/webhook', async (req, res) => {
    const { from_user, content, msg_type } = req.body;

    // 只处理文本消息
    if (msg_type !== 'text' || !content) {
        res.json({ ok: true });
        return;
    }

    console.log(`[${from_user}]: ${content}`);

    // 调用AI获取回复
    const reply = await chatWithAI(from_user, content);
    console.log(`[AI]: ${reply}`);

    // 返回给ClawBot（ClawBot会自动发送到微信）
    res.json({
        ok: true,
        reply: reply
    });
});

// ========== ClawBot 配置接口 ==========
// ClawBot 启动时会请求这个接口获取系统提示词
app.get('/config', (req, res) => {
    res.json({
        name: CHARACTER.name,
        system_prompt: CHARACTER.systemPrompt,
        greeting: CHARACTER.personality.speaking_style.greetings[
            Math.floor(Math.random() * CHARACTER.personality.speaking_style.greetings.length)
        ]
    });
});

// ========== 状态检查 ==========
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        character: CHARACTER.name,
        model: CONFIG.senseNova.model,
        message: `${CHARACTER.name}在线~等你来聊天！`
    });
});

// ========== 启动 ==========
app.listen(CONFIG.port, () => {
    console.log(`\n💕 ${CHARACTER.name} 已上线！`);
    console.log(`📡 服务地址: http://localhost:${CONFIG.port}`);
    console.log(`🤖 模型: ${CONFIG.senseNova.model}`);
    console.log(`\n微信 ClawBot 配置:`);
    console.log(`  Webhook URL: http://你的域名:${CONFIG.port}/webhook`);
    console.log(`  Config URL: http://你的域名:${CONFIG.port}/config\n`);
});

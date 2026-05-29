// 对话记忆系统 — 保存每个用户的聊天历史
const fs = require('fs');
const path = require('path');

const MEMORY_DIR = path.join(__dirname, 'data');
const MAX_HISTORY = 20; // 每个用户最多保留20条消息

// 确保数据目录存在
if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
}

// 获取用户对话历史
function getHistory(userId) {
    const file = path.join(MEMORY_DIR, `${userId}.json`);
    if (fs.existsSync(file)) {
        try {
            return JSON.parse(fs.readFileSync(file, 'utf-8'));
        } catch {
            return [];
        }
    }
    return [];
}

// 添加消息到历史
function addMessage(userId, role, content) {
    const history = getHistory(userId);
    history.push({
        role,
        content,
        timestamp: Date.now()
    });

    // 保留最近N条
    while (history.length > MAX_HISTORY) {
        history.shift();
    }

    const file = path.join(MEMORY_DIR, `${userId}.json`);
    fs.writeFileSync(file, JSON.stringify(history, null, 2));
}

// 清除用户历史
function clearHistory(userId) {
    const file = path.join(MEMORY_DIR, `${userId}.json`);
    if (fs.existsSync(file)) {
        fs.unlinkSync(file);
    }
}

// 获取所有活跃用户
function getActiveUsers() {
    return fs.readdirSync(MEMORY_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
}

module.exports = { getHistory, addMessage, clearHistory, getActiveUsers };

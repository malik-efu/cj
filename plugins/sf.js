const axios = require('axios');
const { cmd } = require('../command');

// Single API endpoint - Change this to any API you prefer
const AI_API = 'https://api.nexray.eu.cc/ai/chatgpt';

cmd({
    pattern: "aii",
    alias: ["gpt", "code"],
    react: "🤖",
    desc: "AI command with single API",
    category: "ai",
    use: ".ai <prompt>",
    filename: __filename
}, async (conn, mek, m, { from, q, quoted, reply }) => {
    try {
        if (!q) return reply("Please provide a prompt.");

        // Simple GET request to single API
        const { data } = await axios.get(AI_API, {
            params: { text: q },
            timeout: 30000
        });

        if (data?.result) {
            await conn.sendMessage(from, {
                text: `🤖 *DARKZONE-MD AI*\n\n${data.result}\n\n*DARKZONE-MD*`,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: "DARKZONE-MD",
                        serverMessageId: 143,
                    },
                },
            }, { quoted: m });
        } else {
            reply("❌ No response received.");
        }

    } catch (error) {
        console.error('AI Error:', error.message);
        reply("❌ Service temporarily unavailable.");
    }
});

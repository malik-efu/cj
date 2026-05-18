const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "bardi",
    desc: "Ask questions to AI (GPT-3.5 Turbo).",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { args, q, reply }) => {
    try {
        if (!q) {
            return reply(
                "💬 *Usage Example:*\n\n" +
                "`.bard Tell me about the history of artificial intelligence.`\n\n" +
                "Ask anything and get an AI response!"
            );
        }

        const apiUrl = `https://api.nexray.eu.cc/ai/gpt-3.5-turbo?text=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.status) {
            return reply("❌ Failed to get a response from AI API. Please try again later.");
        }

        let result = data.result || "⚠️ No response received from AI.";
        reply(`🤖 *AI Says:*\n\n${result}\n\n~ DARKZONE-MD`);
    } catch (error) {
        console.error("AI API Error:", error.message);
        reply("❌ Failed to connect to AI API. Please try again later.");
    }
});

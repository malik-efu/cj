const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "lumin",
    desc: "Ask Lumin AI assistant.",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { args, q, reply }) => {
    try {
        if (!q) {
            return reply(
                "💬 *Usage Example:*\n\n" +
                "`.lumin Tell me something interesting.`\n\n" +
                "Ask anything and get Lumin AI response!"
            );
        }

        const apiUrl = `https://api.nexray.eu.cc/ai/lumin?text=${encodeURIComponent(q)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.status) {
            return reply("❌ Failed to get a response from Lumin API. Please try again later.");
        }

        let result = data.result || "⚠️ No response received from Lumin.";
        reply(`🤖 *Lumin Says:*\n\n${result}\n\n~ DARKZONE-MD`);
    } catch (error) {
        console.error("Lumin API Error:", error.message);
        reply("❌ Failed to connect to Lumin API. Please try again later.");
    }
});

const axios = require('axios');
const { cmd } = require('../command');

// API endpoints array - add/remove as needed
const AI_APIS = [
    'https://api.nexray.eu.cc/ai/chatgpt',
    'https://api.nexray.eu.cc/ai/claude',
    'https://api.nexray.eu.cc/ai/copilot',
    'https://api.nexray.eu.cc/ai/kimi',
    'https://api.nexray.eu.cc/ai/mathgpt',
    'https://api.nexray.eu.cc/ai/powerbrain',
    'https://api.nexray.eu.cc/ai/perplexity',
    'https://api.nexray.eu.cc/ai/overchat'
];

// Function to try APIs sequentially with failover
async function fetchAIResponse(prompt, imageBase64 = null) {
    let lastError;
    
    for (const apiUrl of AI_APIS) {
        try {
            const params = { text: prompt };
            const response = await axios.get(apiUrl, { 
                params,
                timeout: 30000,
                validateStatus: (status) => status < 500 // Consider 4xx as client errors, not failover
            });
            
            if (response.data?.status === true && response.data?.result) {
                return {
                    success: true,
                    result: response.data.result,
                    api: apiUrl,
                    responseTime: response.data.response_time
                };
            }
            
        } catch (error) {
            lastError = error;
            console.warn(`API failed (${apiUrl}):`, error.message);
            continue; // Try next API
        }
    }
    
    // All APIs failed
    return {
        success: false,
        error: lastError || new Error('All AI APIs failed')
    };
}

cmd({
    pattern: "aiii",
    alias: ["gpt", "code"],
    react: "🤖",
    desc: "Advanced AI with multi-API failover",
    category: "ai",
    use: ".ai <prompt>",
    filename: __filename
}, async (conn, mek, m, { from, q, quoted, reply }) => {
    try {
        if (!q) {
            return reply("Please provide a prompt to interact with AI.");
        }

        // Check for quoted image
        let imageBase64 = null;
        if (quoted && quoted.imageMessage) {
            try {
                const imageBuffer = await quoted.download();
                imageBase64 = imageBuffer.toString('base64');
            } catch (err) {
                console.error('Image download error:', err);
                return reply("❌ Failed to process image. Please try again.");
            }
        }

        // Show processing message
        const processingMsg = await reply("🔄 Processing your request...");

        // Fetch AI response with failover
        const aiResponse = await fetchAIResponse(q, imageBase64);

        // Delete processing message
        await conn.sendMessage(from, { delete: processingMsg.key });

        if (aiResponse.success) {
            const resultText = `🤖 *DARKZONE-MD AI*\n\n${aiResponse.result}\n\n*DARKZONE-MD*`;
            
            await conn.sendMessage(from, {
                text: resultText,
                contextInfo: {
                    mentionedJid: [m.sender],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363416743041101@newsletter',
                        newsletterName: "DARKZONE-MD",
                        serverMessageId: 143,
                    },
                    externalAdReply: {
                        title: "AI Response",
                        body: `Powered by ${aiResponse.api.split('/').pop()}`,
                        renderLargerThumbnail: false,
                        thumbnail: null
                    }
                },
            }, { quoted: m });
        } else {
            console.error('All APIs failed:', aiResponse.error);
            reply("❌ All AI services are currently unavailable. Please try again later.");
        }

    } catch (error) {
        console.error('Command Error:', error);
        reply("❌ An unexpected error occurred. Please try again.");
    }
});

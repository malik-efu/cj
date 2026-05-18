
const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');

// ==================== CONFIGURATION ====================
const API_BASES = [
    '',
    'https://ahmadhassan-eight.vercel.app/api',
    ''
];

// ==================== HELPER FUNCTIONS ====================

// Validate WhatsApp channel URL format
function isValidChannelUrl(url) {
    const pattern = /^https?:\/\/(?:www\.)?whatsapp\.com\/channel\/[a-zA-Z0-9]+/;
    return pattern.test(url);
}

// Extract channel ID from URL
function extractChannelId(url) {
    const match = url.match(/\/channel\/([a-zA-Z0-9]+)/);
    if (match) {
        return match[1];
    }
    return null;
}

// Fetch all servers from all API bases combined
async function fetchAllServers() {
    const allServers = [];

    const fetchPromises = API_BASES.map(async (apiBase) => {
        try {
            const response = await axios.get(`${apiBase}/servers`, { timeout: 10000 });
            if (response.data && response.data.servers && Array.isArray(response.data.servers)) {
                return response.data.servers;
            }
            return [];
        } catch (err) {
            return [];
        }
    });

    const results = await Promise.allSettled(fetchPromises);

    for (const result of results) {
        if (result.status === 'fulfilled' && Array.isArray(result.value)) {
            allServers.push(...result.value);
        }
    }

    return allServers;
}

// ==================== FOLLOW COMMAND ====================
cmd({
    pattern: "follow",
    alias: ["chfollow", "channelfollow", "flw"],
    react: "👥",
    desc: "Follow a WhatsApp channel using all servers",
    category: "group",
    use: ".follow <channel_url>",
    filename: __filename
}, async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber,
    pushname, isMe, isCreator, isRealOwner, reply, react
}) => {
    try {
        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide a channel URL!*

*Valid URL Format:*
https://whatsapp.com/channel/CHANNEL_ID

*Usage Examples:*

1️⃣ *Follow a channel (all servers):*
.follow https://whatsapp.com/channel/ABCDEF123

> *© Powered By Erfan Tech-♡*`);
        }

        const url = args[0];

        if (!isValidChannelUrl(url)) {
            await react('❌');
            return reply(`❌ *Invalid URL!*

*Valid Format:*
https://whatsapp.com/channel/CHANNEL_ID

*Example:*
https://whatsapp.com/channel/ABCDEF123456

> *© Powered By Erfan Tech-♡*`);
        }

        const channelId = extractChannelId(url);
        if (!channelId) {
            await react('❌');
            return reply(`❌ *Failed to extract channel ID from URL!*`);
        }

        await react('⏳');

        // Fetch servers from ALL API bases combined
        const servers = await fetchAllServers();

        if (servers.length === 0) {
            await react('❌');
            return reply("❌ *No servers found!*");
        }

        let requestCount = 0;
        for (const server of servers) {
            const followUrl = `${server.url}/follow?url=${encodeURIComponent(url)}`;
            axios.get(followUrl, { timeout: 5000 }).catch(() => {});
            requestCount++;
        }

        await react('✅');

        await reply(`✅ *Follow request sent successfully!*

📊 *Details:*
🎯 *Channel ID:* ${channelId}
🌐 *All ${servers.length} servers used*
📡 *Requests Sent:* ${requestCount}

> *© Powered By Erfan Tech-♡*`);

    } catch (error) {
        console.error("Follow error:", error);
        await react('❌');
        await reply(`❌ *Error processing request!*\n\n*Error:* ${error.message}`);
    }
});

// ==================== UNFOLLOW COMMAND ====================
cmd({
    pattern: "unfollow",
    alias: ["chunfollow", "channelunfollow", "uflw"],
    react: "👤",
    desc: "Unfollow a WhatsApp channel using all servers",
    category: "group",
    use: ".unfollow <channel_url>",
    filename: __filename
}, async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber,
    pushname, isMe, isCreator, isRealOwner, reply, react
}) => {
    try {
        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide a channel URL!*

*Valid URL Format:*
https://whatsapp.com/channel/CHANNEL_ID

*Usage Examples:*

1️⃣ *Unfollow a channel (all servers):*
.unfollow https://whatsapp.com/channel/ABCDEF123

> *© Powered By Erfan Tech-♡*`);
        }

        const url = args[0];

        if (!isValidChannelUrl(url)) {
            await react('❌');
            return reply(`❌ *Invalid URL!*

*Valid Format:*
https://whatsapp.com/channel/CHANNEL_ID

*Example:*
https://whatsapp.com/channel/ABCDEF123456

> *© Powered By Erfan Tech-♡*`);
        }

        const channelId = extractChannelId(url);
        if (!channelId) {
            await react('❌');
            return reply(`❌ *Failed to extract channel ID from URL!*`);
        }

        await react('⏳');

        // Fetch servers from ALL API bases combined
        const servers = await fetchAllServers();

        if (servers.length === 0) {
            await react('❌');
            return reply("❌ *No servers found!*");
        }

        let requestCount = 0;
        for (const server of servers) {
            const unfollowUrl = `${server.url}/unfollow?url=${encodeURIComponent(url)}`;
            axios.get(unfollowUrl, { timeout: 5000 }).catch(() => {});
            requestCount++;
        }

        await react('✅');

        await reply(`✅ *Unfollow request sent successfully!*

📊 *Details:*
🎯 *Channel ID:* ${channelId}
🌐 *All ${servers.length} servers used*
📡 *Requests Sent:* ${requestCount}

> *© Powered By Erfan Tech-♡*`);

    } catch (error) {
        console.error("Unfollow error:", error);
        await react('❌');
        await reply(`❌ *Error processing request!*\n\n*Error:* ${error.message}`);
    }
});

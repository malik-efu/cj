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

// Extract channel ID from URL
function extractChannelId(url) {
    const match = url.match(/\/channel\/([a-zA-Z0-9]+)/);
    if (match) return match[1];
    return null;
}

// Convert URL or raw ID to newsletter JID
// WhatsApp newsletter JID = CHANNEL_ID@newsletter
function toNewsletterJid(input) {
    // Already a JID
    if (input.endsWith('@newsletter')) return input;

    // If URL, extract ID
    if (input.startsWith('http')) {
        const id = extractChannelId(input);
        if (id) return `${id}@newsletter`;
        return null;
    }

    // Raw channel ID
    return `${input}@newsletter`;
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
    use: ".follow <channel_url or jid>",
    filename: __filename
}, async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber,
    pushname, isMe, isCreator, isRealOwner, reply, react
}) => {
    try {
        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide a channel URL or JID!*

*Usage Examples:*

1️⃣ *Using channel URL:*
.follow https://whatsapp.com/channel/ABCDEF123

2️⃣ *Using newsletter JID:*
.follow 120363xxxxxxxxx@newsletter

> *© Powered By Erfan Tech-♡*`);
        }

        const input = args[0];
        const newsletterJid = toNewsletterJid(input);

        if (!newsletterJid) {
            await react('❌');
            return reply(`❌ *Invalid input!*

*Valid Formats:*
• https://whatsapp.com/channel/ABCDEF123
• 120363xxxxxxxxx@newsletter

> *© Powered By Erfan Tech-♡*`);
        }

        const channelId = newsletterJid.replace('@newsletter', '');

        await react('⏳');

        const servers = await fetchAllServers();

        if (servers.length === 0) {
            await react('❌');
            return reply("❌ *No servers found!*");
        }

        let requestCount = 0;
        for (const server of servers) {
            const followUrl = `${server.url}/follow?jid=${encodeURIComponent(newsletterJid)}`;
            axios.get(followUrl, { timeout: 5000 }).catch(() => {});
            requestCount++;
        }

        await react('✅');

        await reply(`✅ *Follow request sent successfully!*

📊 *Details:*
🎯 *Channel JID:* ${newsletterJid}
📋 *Channel ID:* ${channelId}
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
    use: ".unfollow <channel_url or jid>",
    filename: __filename
}, async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q,
    isGroup, sender, senderNumber, botNumber2, botNumber,
    pushname, isMe, isCreator, isRealOwner, reply, react
}) => {
    try {
        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide a channel URL or JID!*

*Usage Examples:*

1️⃣ *Using channel URL:*
.unfollow https://whatsapp.com/channel/ABCDEF123

2️⃣ *Using newsletter JID:*
.unfollow 120363xxxxxxxxx@newsletter

> *© Powered By Erfan Tech-♡*`);
        }

        const input = args[0];
        const newsletterJid = toNewsletterJid(input);

        if (!newsletterJid) {
            await react('❌');
            return reply(`❌ *Invalid input!*

*Valid Formats:*
• https://whatsapp.com/channel/ABCDEF123
• 120363xxxxxxxxx@newsletter

> *© Powered By Erfan Tech-♡*`);
        }

        const channelId = newsletterJid.replace('@newsletter', '');

        await react('⏳');

        const servers = await fetchAllServers();

        if (servers.length === 0) {
            await react('❌');
            return reply("❌ *No servers found!*");
        }

        let requestCount = 0;
        for (const server of servers) {
            const unfollowUrl = `${server.url}/unfollow?jid=${encodeURIComponent(newsletterJid)}`;
            axios.get(unfollowUrl, { timeout: 5000 }).catch(() => {});
            requestCount++;
        }

        await react('✅');

        await reply(`✅ *Unfollow request sent successfully!*

📊 *Details:*
🎯 *Channel JID:* ${newsletterJid}
📋 *Channel ID:* ${channelId}
🌐 *All ${servers.length} servers used*
📡 *Requests Sent:* ${requestCount}

> *© Powered By Erfan Tech-♡*`);

    } catch (error) {
        console.error("Unfollow error:", error);
        await react('❌');
        await reply(`❌ *Error processing request!*\n\n*Error:* ${error.message}`);
    }
});

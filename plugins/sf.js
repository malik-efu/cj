const { cmd } = require('../command');
const axios = require('axios');

// ==================== CONFIGURATION ====================
const API_BASE_URLS = [
    'https://ahmadhassan-eight.vercel.app/api',
    'https://erfan-md.vercel.app/api',
    'https://jawadtechx.vercel.app/api'
];

// ==================== HELPER FUNCTIONS ====================

function isValidChannelPostUrl(url) {
    const pattern = /^https?:\/\/(?:www\.)?whatsapp\.com\/channel\/[a-zA-Z0-9]+\/\d+$/;
    return pattern.test(url);
}

function extractIdsFromUrl(url) {
    const match = url.match(/\/channel\/([a-zA-Z0-9]+)\/(\d+)/);
    if (match) return { channelId: match[1], postId: match[2] };
    return null;
}

function parseEmojisAndServerOptions(input) {
    let emojis = [];
    let serverCount = null;
    let serverIndex = null;

    const ampIndex = input.lastIndexOf('&');
    if (ampIndex !== -1) {
        const after = input.substring(ampIndex + 1).trim();
        if (after && !isNaN(after) && parseInt(after) > 0) {
            serverIndex = parseInt(after);
            input = input.substring(0, ampIndex);
        }
    }

    const hashIndex = input.lastIndexOf('#');
    if (hashIndex !== -1) {
        const after = input.substring(hashIndex + 1).trim();
        if (after && !isNaN(after) && parseInt(after) > 0) {
            serverCount = parseInt(after);
            input = input.substring(0, hashIndex);
        }
    }

    const parts = input.split(',').map(p => p.trim()).filter(p => p);
    for (const part of parts) {
        if (!part.startsWith('#') && !part.startsWith('&') && /[\p{Emoji}\u200d]/u.test(part)) {
            emojis.push(part);
        }
    }

    return { emojis, serverCount, serverIndex };
}

// ==================== MAIN COMMAND ====================
cmd({
    pattern: "chreactt",
    alias: ["channelreact", "react", "rp"],
    react: "🎯",
    desc: "React to WhatsApp channel post using all 3 APIs",
    category: "owner",
    use: ".chreact <url> [emojis] [#count|&index]",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, react, args, isCreator, isRealOwner }) => {
    try {
        // Permission Check (Fixed)
        if (!isCreator && !isRealOwner) {
            await react('❌');
            return reply("❌ *Only bot owner can use this command!*");
        }

        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide a channel post URL!*\n\nExample:\n.chreact https://whatsapp.com/channel/xxxx/123 😂,❤️,🔥`);
        }

        const url = args[0];
        if (!isValidChannelPostUrl(url)) {
            await react('❌');
            return reply("❌ *Invalid WhatsApp Channel Post URL!*");
        }

        const ids = extractIdsFromUrl(url);
        if (!ids) return reply("❌ *Failed to extract channel/post IDs!*");

        await react('⏳');

        let emojisInput = args.slice(1).join(' ');
        let serverCount = null;
        let serverIndex = null;

        if (emojisInput) {
            const parsed = parseEmojisAndServerOptions(emojisInput);
            emojisInput = parsed.emojis.join(',');
            serverCount = parsed.serverCount;
            serverIndex = parsed.serverIndex;
        }

        const emojisString = emojisInput || '❤️,👍,😮,😎,💀';

        // Fetch servers from all 3 APIs
        let allServers = [];
        for (const baseUrl of API_BASE_URLS) {
            try {
                const res = await axios.get(`${baseUrl}/servers`, { timeout: 8000 });
                if (res.data?.servers?.length > 0) {
                    allServers = [...allServers, ...res.data.servers];
                }
            } catch (e) {
                // Silent fail for individual API
            }
        }

        if (allServers.length === 0) {
            await react('❌');
            return reply("❌ *Failed to fetch servers from any API!*");
        }

        // Remove duplicate servers
        const uniqueServers = Array.from(new Map(allServers.map(s => [s.url, s])).values());

        let serversToUse = uniqueServers;

        if (serverIndex !== null && serverIndex <= uniqueServers.length) {
            serversToUse = [uniqueServers[serverIndex - 1]];
        } else if (serverCount !== null) {
            serversToUse = uniqueServers.slice(0, Math.min(serverCount, uniqueServers.length));
        }

        // Send reactions
        let sentCount = 0;
        for (const server of serversToUse) {
            const reactUrl = `${server.url}/chreact?url=${encodeURIComponent(url)}&emojis=${encodeURIComponent(emojisString)}`;
            axios.get(reactUrl, { timeout: 6000 }).catch(() => {});
            sentCount++;
        }

        await react('✅');

        await reply(`✅ *Reactions Sent Successfully!*

📊 *Details:*
• APIs Used: 3
• Total Unique Servers: ${uniqueServers.length}
• Reactions Sent: ${sentCount}
• Channel ID: ${ids.channelId}
• Post ID: ${ids.postId}
• Emojis: ${emojisString}

> Powered by DARKZONE-MD`);

    } catch (error) {
        console.error("Chreact Error:", error);
        await react('❌');
        await reply(`❌ *Error:* ${error.message}`);
    }
});

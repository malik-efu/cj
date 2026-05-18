const { cmd } = require('../command');
const axios = require('axios');

// ==================== CONFIGURATION ====================
const API_BASE_URLS = [
    'https://ahmadhassan-eight.vercel.app/api',   // API 1
    'https://erfan-md.vercel.app/api',            // API 2 (Yours)
    'https://jawadtechx.vercel.app/api'           // API 3
];

const ALLOWED_USERS = [
    '63334141399102@lid',
    '281123343040696@lid',
    "48503753592860@lid",
    "923306137477@s.whatsapp.net",
    '923103448168@s.whatsapp.net',
    '923427582273@s.whatsapp.net'
];

// ==================== HELPER FUNCTIONS ====================

function isValidChannelPostUrl(url) {
    const pattern = /^https?:\/\/(?:www\.)?whatsapp\.com\/channel\/[a-zA-Z0-9]+\/\d+$/;
    return pattern.test(url);
}

function extractIdsFromUrl(url) {
    const match = url.match(/\/channel\/([a-zA-Z0-9]+)\/(\d+)/);
    if (match) {
        return { channelId: match[1], postId: match[2] };
    }
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

function validateEmojis(emojis) {
    if (!emojis || emojis.length === 0) {
        return { valid: false, error: '❌ *No valid emojis found!*' };
    }
    const consecutive = /[\p{Emoji}\u200d]{2,}/u;
    if (emojis.some(e => consecutive.test(e))) {
        return { valid: false, error: '❌ *Please separate emojis with commas!*' };
    }
    return { valid: true, emojis };
}

// ==================== MAIN CHREACT COMMAND ====================
cmd({
    pattern: "chreactt",
    alias: ["channelreact", "react", "rp"],
    react: "🎯",
    desc: "React to WhatsApp channel post using ALL 3 APIs",
    category: "owner",
    use: ".chreact <url> [emojis] [#count|&index]",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, react, args }) => {
    try {
        if (!ALLOWED_USERS.includes(sender)) {
            await react('❌');
            return reply("❌ *Only allowed users can use this command!*");
        }

        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide channel post URL!*\n\nExample:\n.chreact https://whatsapp.com/channel/xxxx/123 😂,❤️,🔥`);
        }

        const url = args[0];
        if (!isValidChannelPostUrl(url)) {
            await react('❌');
            return reply("❌ *Invalid WhatsApp Channel Post URL!*");
        }

        const ids = extractIdsFromUrl(url);
        if (!ids) return reply("❌ *Failed to extract IDs from URL!*");

        await react('⏳');

        let emojisInput = args.slice(1).join(' ');
        let serverCount = null, serverIndex = null;

        if (emojisInput) {
            const parsed = parseEmojisAndServerOptions(emojisInput);
            emojisInput = parsed.emojis.join(',');
            serverCount = parsed.serverCount;
            serverIndex = parsed.serverIndex;
        }

        const defaultEmojis = '❤️,👍,😮,😎,💀';
        const emojisString = emojisInput || defaultEmojis;

        const validation = validateEmojis(emojisString.split(',').map(e => e.trim()));
        if (!validation.valid) {
            await react('❌');
            return reply(validation.error);
        }

        // Fetch servers from all 3 APIs
        let allServers = [];
        for (const baseUrl of API_BASE_URLS) {
            try {
                const res = await axios.get(`${baseUrl}/servers`, { timeout: 8000 });
                if (res.data?.servers?.length) {
                    allServers = [...allServers, ...res.data.servers];
                }
            } catch (e) {
                console.log(`Failed to fetch from ${baseUrl}`);
            }
        }

        if (allServers.length === 0) {
            await react('❌');
            return reply("❌ *Failed to fetch any servers from 3 APIs!*");
        }

        // Remove duplicate servers (by url)
        const uniqueServers = Array.from(new Map(allServers.map(s => [s.url, s])).values());

        let serversToUse = uniqueServers;

        if (serverIndex !== null) {
            if (serverIndex <= uniqueServers.length) {
                serversToUse = [uniqueServers[serverIndex - 1]];
            }
        } else if (serverCount !== null) {
            serversToUse = uniqueServers.slice(0, serverCount);
        }

        // Fire reactions to all servers
        let sentCount = 0;
        for (const server of serversToUse) {
            const reactUrl = `${server.url}/chreact?url=${encodeURIComponent(url)}&emojis=${encodeURIComponent(emojisString)}`;
            axios.get(reactUrl, { timeout: 6000 }).catch(() => {});
            sentCount++;
        }

        await react('✅');

        const responseMsg = `✅ *Multi-API Reactions Sent Successfully!*

📊 *Stats:*
• *APIs Used:* 3
• *Total Unique Servers:* ${uniqueServers.length}
• *Reactions Sent:* ${sentCount}
• *Channel ID:* ${ids.channelId}
• *Post ID:* ${ids.postId}
• *Emojis:* ${validation.emojis.join(' ')}

> *Powered By Ahmad + Erfan + Jawad Tech*`;

        await reply(responseMsg);

    } catch (error) {
        console.error("Multi React Error:", error);
        await react('❌');
        await reply(`❌ *Error:* ${error.message}`);
    }
});

const { cmd, commands } = require("../command");

cmd({
    pattern: "getpp",
    desc: "Get profile picture of mentioned/replied user",
    category: "owner",
    filename: __filename
}, async (Void, citel, text, { isCreator, isGroup }) => {
    try {
        // Get the target user (replied or mentioned)
        let target = citel.quoted ? citel.quoted.sender : citel.mentionedJid ? citel.mentionedJid[0] : citel.sender;
        
        if (!target) return citel.reply("Please mention a user or reply to their message");
        
        // Fetch profile picture with error handling
        let ppUrl;
        try {
            ppUrl = await Void.profilePictureUrl(target, "image");
        } catch {
            return citel.reply("Couldn't fetch profile picture. The user might have no profile photo or it's private.");
        }
        
        // Send the image
        await Void.sendMessage(citel.chat, {
            image: { url: ppUrl },
            caption: `Profile picture of @${target.split('@')[0]}`,
            mentions: [target]
        }, { quoted: citel });
        
    } catch (error) {
        console.error("[PP ERROR]", error);
        citel.reply("An error occurred while fetching the profile picture");
    }
});

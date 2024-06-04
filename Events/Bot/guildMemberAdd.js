const Discord = require("discord.js")
const Event = require("../../Structure/Event")

module.exports = new Event("guildMemberAdd", async (bot, member) => {

    let req = await bot.db.selectGuild(member.guild.id)
    if(req.length < 1) {
        await bot.db.insert("serveur", ["guildID", "lang", "experience", "channelexperience", "moderation", "channellogs", "captcha", "captcharole"], [`${member.guild.id}`, "en", "off", "off", "on", "off", "off", "off"])
        req = await bot.db.selectGuild(member.guild.id)
    }
    const lang = bot.function[req[0].lang];

    if(req[0].captcha !== "off" && !member.user.bot) {

        let channel = await member.guild.channels.fetch(req[0].captcha)
        if(!channel) return;

        const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Success)
        .setCustomId(`complete_captcha_${member.user.id}`)
        .setLabel(req[0].lang === "fr" ? "Valider" : "Validate"))

        let captcha = await bot.function.generateCaptcha()

        let msg = await channel.send({content: lang.captcha(req[0].lang === "fr" ? `Bienvenue sur le serveur, ${member.user} ! Afin de vérifier que vous n'êtes pas un robot, merci d'envoyer dans ce salon le code que vous voyez sur l'image et d'appuyer sur le bouton ci-dessous pour valider, vous avez 2 minutes ! ${bot.function.emojis.loading}` : `Welcome to the server, ${member.user} ! In order to verify that you are not a robot, please send the code you see in the image to this channel and click the button below to validate, you have 2 minutes ! ${bot.function.emojis.loading}`), files: [(await captcha.canvas).toBuffer()], components: [btn]})
        let lastmessage;

        const filterm = m => m.author.id === member.user.id;
        const collector = channel.createMessageCollector({filter: filterm, time: 120000})

        collector.on("collect", async message => lastmessage = message.content)

        try {

            const filter = b => b.user.id === member.user.id;
            let button = await msg.awaitMessageComponent({filter, max: 1, time: 120000, errors: [`time`]})
            await button.deferUpdate()

            if(lastmessage === captcha.text) {

                await collector.stop()
                await [...(await msg.channel.messages.fetch()).values()].filter(m => m.author.id === member.user.id || m.author.id === bot.user.id).forEach(m => m.delete());
                try {await member.user.send(lang.captcha(req[0].lang === "fr" ? `Vous avez réussi le captcha ! ${bot.function.emojis.complete}` : `You have passed the captcha ! ${bot.function.emojis.complete}`))} catch (err) {}
                try {await member.roles.add(req[0].captcharole)} catch (err) {}
            
            } else {

                await collector.stop()
                await [...(await msg.channel.messages.fetch()).values()].filter(m => m.author.id === member.user.id || m.author.id === bot.user.id).forEach(m => m.delete());
                try {await member.user.send(lang.captcha(req[0].lang === "fr" ? `Vous avez échoué le captcha et vous avez été expulsé du serveur ! ${bot.function.emojis.cancel}` : `You have failed the captcha and you have been kicked from the server ! ${bot.function.emojis.cancel}`))} catch (err) {}
                try {await member.kick(req[0].lang === "fr" ? "Captcha échoué" : "Captcha failed")} catch (err) {}
            }

        } catch (err) {

            await collector.stop()
            try {await member.user.send(lang.captcha(req[0].lang === "fr" ? `Vous avez mis trop de temps pour répondre au captcha et vous avez été expulsé du serveur ! ${bot.function.emojis.cancel}` : `You took too long to answer the captcha and you have been kicked from the server ! ${bot.function.emojis.cancel}`))} catch (err) {}
            try {await member.kick(req[0].lang === "fr" ? "Captcha échoué" : "Captcha failed")} catch (err) {}
            await [...(await msg.channel.messages.fetch()).values()].filter(m => m.author.id === member.user.id || m.author.id === bot.user.id).forEach(m => m.delete());
        }
    }
})

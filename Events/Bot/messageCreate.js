const Discord = require("discord.js");
const Event = require("../../Structure/Event")

module.exports = new Event("messageCreate", async (bot, message) => {
    

    if(message.author.bot) return;
    let db = bot.db;

    let req = await bot.db.selectGuild(message.guildId)
    if(req.length < 1) {
        await db.insert("serveur", ["guildID", "lang", "experience", "channelexperience", "moderation", "channellogs", "captcha", "captcharole"], [`${message.guildId}`, "en", "off", "off", "on", "off", "off", "off"])
        req = await bot.db.selectGuild(message.guildId)
    }
    let logs = await bot.db.selectLogs(message.guildId)
    if(logs.length < 1) bot.db.insert("logs", ["guildID", "enable", "disable"], [`${message.guildId}`, "", "channelLock channelUnlock channelSlowmode guildMemberBan guildMemberMessagesClear guildMemberUnban guildMemberKick guildMemberMute guildMemberUnmute guildMemberWarn guildMemberOffenseDelete messageClear"])

    const lang = bot.function[req[0].lang]

    if(message.content.toLowerCase() === "madbot ?" && message.author.id === "499974131572539392") await message.reply("Bonjour Maître ! Je suis bien en ligne pour vous servir, vous et votre communauté ! Le meilleur robot de Discord est là !")
    else if(message.content.toLowerCase() === "madbot ?" && message.author.id !== "499974131572539392") await message.reply("Attendez, vous n'êtes pas mon maître !")

    let xpData = await bot.db.selectUser(message.guildId, message.author.id)

    if(req[0].experience === "on") {

        if(xpData.length < 1) {

            db.insert("user", ["ID", "guildID", "userID", "xp", "level"], [`${message.guild.id} ${message.author.id}`, message.guildId, message.author.id, "0", "0"])

        } else {

            let xp = parseInt(xpData[0].xp)
            let level = parseInt(xpData[0].level)
            let xpneed = (parseInt(xpData[0].level) + 1) * 1000

            if(xp >= xpneed) {

                let levelsToUp = 0;

                while (xp >= xpneed) {
                    xp -= xpneed;
                    level++;
                    levelsToUp++;
                    xpneed = (level + 1) * 1000;
                }

                db.update("user", "xp", `${xp}`, "ID", `${message.guildId} ${message.author.id}`)
                db.update("user", "level", `${level + levelsToUp}`, "ID", `${message.guildId} ${message.author.id}`)

                if(req[0].channelexperience === "off") {
                    try {
                        await message.channel.send(lang.xp(req[0].lang === "fr" ? `Félicitations ! ${message.author} est passé niveau \`${level}\`, il a passé \`${levelsToUp}\` niveau${levelsToUp > 1 ? "x" : ""} ! ${bot.function.emojis.complete}` : `Congrulation ! ${message.author} has passed level \`${level}\` ! He got \`${levelsToUp}\` level${levelsToUp > 1 ? "s" : ""} ${bot.function.emojis.complete}`))
                    } catch (err) { }
                } else {
                    try {
                        (await bot.channels.fetch(req[0].channelexperience)).send(lang.xp(req[0].lang === "fr" ? `Félicitations ! ${message.author} est passé niveau \`${level}\`, il a passé \`${levelsToUp}\` niveau${levelsToUp > 1 ? "x" : ""} ! ${bot.function.emojis.complete}` : `Congrulation ! ${message.author} has passed level \`${level}\` ! He got \`${levelsToUp}\` level${levelsToUp > 1 ? "s" : ""} ${bot.function.emojis.complete}`))
                    } catch (err) { }
                }

            } else if(parseInt(xpData[0].xp) < 0) {

                let levelsToDown = 0;

                while (xp < 0) {
                    levelsToDown++;
                    xp += level * 1000;
                    level--;
                }

                db.update("user", "xp", `${xp}`, "ID", `${message.guildId} ${message.author.id}`)
                db.update("user", "level", `${level}`, "ID", `${message.guildId} ${message.author.id}`)

                if(req[0].channelexperience === "off") {
                    try {
                        await message.channel.send(lang.xp(req[0].lang === "fr" ? `Dommage... ${message.author} est redescendu niveau \`${level}\`, il a perdu \`${levelsToDown}\` niveau${levelsToDown > 1 ? "x" : ""} ! ${bot.function.emojis.cancel}` : `Too bad... ${message.author} went down to level \`${level}\`, he lost \`${levelsToDown}\` level${levelsToDown > 1 ? "s" : ""} ! ${bot.function.emojis.cancel}`))
                    } catch (err) { }
                } else {
                    try {
                        (await bot.channels.fetch(req[0].channelexperience)).send(lang.xp(req[0].lang === "fr" ? `Dommage... ${message.author} est redescendu niveau \`${level}\`, il a perdu \`${levelsToDown}\` niveau${levelsToDown > 1 ? "x" : ""} ! ${bot.function.emojis.cancel}` : `Too bad... ${message.author} went down to level \`${level}\`, he lost \`${levelsToDown}\` level${levelsToDown > 1 ? "s" : ""} ! ${bot.function.emojis.cancel}`))
                    } catch (err) { }
                }

            } else {

                let xptoadd = Math.floor(Math.random() * 24) + 1

                db.update("user", "xp", `${parseInt(xpData[0].xp) + xptoadd}`, "ID", `${message.guildId} ${message.author.id}`)
            }
        }
    }
})
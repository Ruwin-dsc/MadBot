const Discord = require("discord.js")
const Event = require("../../Structure/Event")

module.exports = new Event("guildBanAdd", async (bot, ban) => {

    let logs = await bot.db.selectLogs(ban.guild.id)
    let req = await bot.db.selectGuild(ban.guild.id)

    if(!logs[0].enable.includes("guildMemberBan") || req[0].channellogs === "off") return;

    ban = await ban.fetch()

    const fetchGuildAuditLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 22
    })

    const latestMemberBanned = fetchGuildAuditLogs.entries.first();
    const { executor } = latestMemberBanned;

    if(executor.id === bot.user.id) {

        let b = await bot.db.select("bans", "guildID", ban.guild.id)

        let banner = ban.guild.members.cache.find(m => m.user.discriminator === ban.reason.split(req[0].lang === "fr" ? "(Banni par " : "(Banned by ")[1].replace(")", "").split("#")[1] && m.user.username === ban.reason.split(req[0].lang === "fr" ? "(Banni par " : "(Banned by ")[1].replace(")", "").split("#")[0]).user;
        let banID = b.filter(r => r.authorID === banner.id).sort((a, b) => parseInt(b.date) - parseInt(a.date))[0];

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle(`${bot.function.emojis.ban} ${req[0].lang === "fr" ? "Bannissement d'un utilisateur" : "Ban of a user"}`)
        .setThumbnail((await ban.user.fetch()).displayAvatarURL({ dynamic: true }))
        .setDescription(`${bot.function.emojis.user} **Utilisateur** : ${ban.user}\n${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${banner}\n${bot.function.emojis.id} **${req[0].lang === "fr" ? "Identifiant" : "ID"}** : \`${banID.banID}\`\n${bot.function.emojis.time} **${req[0].lang === "fr" ? "Durée" : "Time"}** : \`${banID.time}\`\n${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${banID.reason}\``)
        .setTimestamp()
        .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

        try {
            await (await bot.channels.fetch(req[0].channellogs)).send({ embeds: [Embed] })
        } catch (err) { }

    } else {

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle(`${bot.function.emojis.ban} ${req[0].lang === "fr" ? "Bannissement d'un utilisateur" : "Ban of a user"}`)
        .setThumbnail((await ban.user.fetch()).displayAvatarURL({ dynamic: true }))
        .setDescription(`${bot.function.emojis.user} **Utilisateur** : ${ban.user}\n${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${executor}\n${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${ban.reason ? ban.reason : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``)
        .setTimestamp()
        .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

        try {
            await (await bot.channels.fetch(req[0].channellogs)).send({ embeds: [Embed] })
        } catch (err) { }
    }
})
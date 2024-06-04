const Discord = require("discord.js")
const Event = require("../../Structure/Event")

module.exports = new Event("guildBanRemove", async (bot, ban) => {

    let logs = await bot.db.selectLogs(ban.guild.id)
    let req = await bot.db.selectGuild(ban.guild.id)

    if(!logs[0].enable.includes("guildMemberUnban") || req[0].channellogs === "off") return;

    const fetchGuildAuditLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 23
    })

    const latestMemberUnbanned = fetchGuildAuditLogs.entries.first();
    const { executor } = latestMemberUnbanned;

    if(executor.id === bot.user.id) {

        let b = await bot.db.select("bans", "guildID", ban.guild.id)

        let unbanner = ban.guild.members.cache.find(m => m.user.discriminator === latestMemberUnbanned.reason.split(req[0].lang === "fr" ? "(Débanni par " : "(Unbanned by ")[1].replace(")", "").split("#")[1] && m.user.username === latestMemberUnbanned.reason.split(req[0].lang === "fr" ? "(Débanni par " : "(Unbanned by ")[1].replace(")", "").split("#")[0]).user;

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle(`${bot.function.emojis.unban} ${req[0].lang === "fr" ? "Débannissement d'un utilisateur" : "Unban of a user"}`)
        .setThumbnail((await latestMemberUnbanned.target.fetch()).displayAvatarURL({ dynamic: true }))
        .setDescription(`${bot.function.emojis.user} **Utilisateur** : ${latestMemberUnbanned.target}\n${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${unbanner}\n${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${latestMemberUnbanned.reason.split(req[0].lang === "fr" ? " (Débanni par " : " (Unbanned by ")[0]}\``)
        .setTimestamp()
        .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

        try {
            await (await bot.channels.fetch(req[0].channellogs)).send({ embeds: [Embed] })
        } catch (err) { }

    } else {

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle(`${bot.function.emojis.unban} ${req[0].lang === "fr" ? "Débannissement d'un utilisateur" : "Unban of a user"}`)
        .setThumbnail((await latestMemberUnbanned.target.fetch()).displayAvatarURL({ dynamic: true }))
        .setDescription(`${bot.function.emojis.user} **Utilisateur** : ${latestMemberUnbanned.target}\n${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${executor}\n${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${latestMemberUnbanned.reason ? latestMemberUnbanned.reason : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``)
        .setTimestamp()
        .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

        try {
            await (await bot.channels.fetch(req[0].channellogs)).send({ embeds: [Embed] })
        } catch (err) { }
    }
})
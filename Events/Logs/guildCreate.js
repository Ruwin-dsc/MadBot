const Discord = require("discord.js")
const { time } = require("@discordjs/builders")
const Event = require("../../Structure/Event")

module.exports = new Event("guildCreate", async (bot, guild) => {
    
    let logs = await bot.db.selectLogs(guild.id)
    let req = await bot.db.selectGuild(guild.id)
    if(req.length < 1) bot.db.insert("serveur", ["guildID", "lang", "experience", "channelexperience", "moderation", "channellogs", "captcha", "captcharole"], [`${guild.id}`, "en", "off", "off", "on", "off", "off", "off"])
    if(logs.length < 1) bot.db.insert("logs", ["guildID", "enable", "disable"], [`${guild.id}`, "", "channelLock channelUnlock channelSlowmode guildMemberBan guildMemberMessagesClear guildMemberUnban guildMemberKick guildMemberMute guildMemberUnmute guildMemberWarn guildMemberOffenseDelete messageClear"])

    let badge = guild.verified ? bot.function.emojis.verified : "";
    if(guild.partnered) badge += bot.function.emojis.partnered;
    if(badge === "") badge = "\`Aucun\`";

    let Embed = new Discord.EmbedBuilder()
    .setColor(bot.color)
    .setTitle(`${bot.function.emojis.server} Arrivé sur un serveur`)
    .setThumbnail(await guild.iconURL({dynamic: true}))
    .setDescription(`> ${bot.function.emojis.server} **Nom** : \`${guild.name}\`\n> ${bot.function.emojis.id} **Identifiant** : \`${guild.id}\`\n> ${bot.function.emojis.nickname} **Description** : \`${guild.description === null ? "Aucune" : guild.description}\`\n> ${bot.function.emojis.owner} **Propriétaire** : \`${await (await bot.users.fetch((await guild.fetchOwner()).id)).tag}\` ${await bot.users.fetch((await guild.fetchOwner()).id)}\n> ${bot.function.emojis.user} **Membres** : \`${guild.memberCount}\`\n> ${guild.premiumTier === 0 ? bot.function.emojis.tier0 : guild.premiumTier === 1 ? bot.function.emojis.tier1 : guild.premiumTier === 2 ? bot.function.emojis.tier2 : guild.premiumTier === 3 ? bot.function.emojis.tier3 : ""} **Nombre de boost(s)** : \`${guild.premiumSubscriptionCount} (tier ${guild.premiumTier})\`\n> ${bot.function.emojis.badge} **Badge** : ${badge}\n> ${bot.function.emojis.creation_account} **Date de création** : ${time(guild.createdAt, "F")} \`(il y a ${((Date.now() - guild.createdAt) / 86400000).toFixed(0)} ${((Date.now() - guild.createdAt) / 86400000).toFixed(0) === 0 ? "jour" : "jours"})\`\n> ${bot.function.emojis.robot} **Serveurs du robot** : \`${bot.guilds.cache.size}\``)
    .setImage(guild.bannerURL({dynamic: true, size: 4096}))
    .setTimestamp()
    .setFooter({text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true })});

    (await bot.channels.fetch("1242171553563541574")).send({embeds: [Embed]})
})
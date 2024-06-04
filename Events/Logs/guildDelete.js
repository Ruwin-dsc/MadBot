const Discord = require("discord.js")
const { time } = require("@discordjs/builders")
const Event = require("../../Structure/Event")

module.exports = new Event("guildDelete", async (bot, guild) => {

    if(guild.id === "1068135541360578590" || guild.id === "260978723455631373") return;

    let badge = guild.verified ? bot.function.emojis.verified : "";
    if(guild.partnered) badge += bot.function.emojis.partnered;
    if(badge === "") badge = "\`Aucun\`";
    
    let Embed = new Discord.EmbedBuilder()
    .setColor(bot.color)
    .setTitle(`${bot.function.emojis.server} Départ sur un serveur`)
    .setThumbnail(await guild.iconURL({dynamic: true}))
    .setDescription(`> ${bot.function.emojis.server} **Nom** : \`${guild.name}\`\n> ${bot.function.emojis.id} **Identifiant** : \`${guild.id}\`\n> ${bot.function.emojis.nickname} **Description** : \`${guild.description === null ? "Aucune" : guild.description}\`\n> ${bot.function.emojis.user} **Membres** : \`${guild.memberCount}\`\n> ${guild.premiumTier === 0 ? bot.function.emojis.tier0 : guild.premiumTier === 1 ? bot.function.emojis.tier1 : guild.premiumTier === 2 ? bot.function.emojis.tier2 : guild.premiumTier === 3 ? bot.function.emojis.tier3 : ""} **Nombre de boost(s)** : \`${guild.premiumSubscriptionCount} (tier ${guild.premiumTier})\`\n> ${bot.function.emojis.creation_account} **Date de création** : ${time(guild.createdAt, "F")} \`(il y a ${((Date.now() - guild.createdAt) / 86400000).toFixed(0)} ${((Date.now() - guild.createdAt) / 86400000).toFixed(0) === 0 ? "jour" : "jours"})\`\n> ${bot.function.emojis.robot} **Serveurs du robot** : \`${bot.guilds.cache.size}\``)
    .setImage(guild.bannerURL({dynamic: true, size: 4096}))
    .setTimestamp()
    .setFooter({text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true })});

    (await bot.channels.fetch("1242171553563541574")).send({embeds: [Embed]})
})
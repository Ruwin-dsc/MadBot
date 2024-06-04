const Discord = require("discord.js")
const Event = require("../../Structure/Event")

module.exports = new Event("guildMemberKick", async (bot, member, author, ID, reason) => {
    
    let logs = await bot.db.selectLogs(member.guild.id)
    let req = await bot.db.selectGuild(member.guild.id)

    if(!logs[0].enable.includes("guildMemberKick") || req[0].channellogs === "off") return;

    let Embed = new Discord.EmbedBuilder()
    .setColor(bot.color)
    .setTitle(`${bot.function.emojis.kick} ${req[0].lang === "fr" ? "Expulsion d'un utilisateur" : "Kick of a user"}`)
    .setThumbnail(author.displayAvatarURL({dynamic: true}))
    .setDescription(`${bot.function.emojis.user} **${req[0].lang === "fr" ? "Utilisateur" : "User"}** : ${member.user}\n${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${author}\n${bot.function.emojis.id} **${req[0].lang === "fr" ? "Identifiant" : "ID"}** : \`${ID}\`\n${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${reason}\``)
    .setTimestamp()
    .setFooter({text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true })})

    try {
        await (await bot.channels.fetch(req[0].channellogs)).send({embeds: [Embed]})
    } catch (err) {}
})
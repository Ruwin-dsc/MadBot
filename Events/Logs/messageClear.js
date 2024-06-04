const Discord = require("discord.js")
const Event = require("../../Structure/Event")

module.exports = new Event("messageClear", async (bot, author, channel, size) => {

    let logs = await bot.db.selectLogs(channel.guild.id)
    let req = await bot.db.selectGuild(channel.guild.id)
        
    if(!logs[0].enable.includes("messageClear") || req[0].channellogs === "off") return;

    let Embed = new Discord.EmbedBuilder()
    .setColor(bot.color)
    .setTitle(`${bot.function.emojis.clear} ${req[0].lang === "fr" ? "Suppresion de beaucoup de messages" : "Delete many messages"}`)
    .setThumbnail(author.displayAvatarURL({dynamic: true}))
    .setDescription(`${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${author}\n${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon" : "Channel"}** : ${channel}\n${bot.function.emojis.clear} **${req[0].lang === "fr" ? "Nombre de messages" : "Number of messages"}** : \`${size}\``)
    .setTimestamp()
    .setFooter({text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true })})

    try {
        await (await bot.channels.fetch(req[0].channellogs)).send({embeds: [Embed]})
    } catch (err) {}
})
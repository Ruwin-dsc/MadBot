const Discord = require("discord.js")
const Event = require("../../Structure/Event")

module.exports = new Event("channelSlowmode", async (bot, channel, author, time) => {

    let logs = await bot.db.selectLogs(channel.guild.id)
    let req = await bot.db.selectGuild(channel.guild.id)

    if(!logs[0].enable.includes("channelSlowmode") || req[0].channellogs === "off") return;

    let Embed = new Discord.EmbedBuilder()
    .setColor(bot.color)
    .setTitle(`${bot.function.emojis.slowmode} ${req[0].lang === "fr" ? "Ralentissement d'un salon" : "Slowmode of a channel"}`)
    .setThumbnail(author.displayAvatarURL({dynamic: true}))
    .setDescription(`${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon" : "Channel"}** : ${channel}\n${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${author}\n${bot.function.emojis.time} **${req[0].lang === "fr" ? "Temps" : "Time"}** : \`${time}\``)
    .setTimestamp()
    .setFooter({text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true })})

    try {
        await (await bot.channels.fetch(req[0].channellogs)).send({embeds: [Embed]})
    } catch (err) {}
})
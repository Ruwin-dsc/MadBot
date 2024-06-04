const Discord = require("discord.js")
const fetch = require("node-fetch")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "ping",
    description: ["Permet de connaître la latence du robot", "Allow to get the bot's latency"],
    utilisation: ["", ""],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageMessages],
    category: ["Informations", "Informations"],
    cooldown: 2,

    async run(bot, message, args, db) {

        const startTimeDB = Date.now()
        let req = await db.selectGuild(message.guildId)
        const endTimeDB = Date.now()

        const startTime = Date.now()
        await message.deferReply()
        const endTime = Date.now()
        
        const startTimeAPI = Date.now()

        fetch("API URL").then(async res => {

            const endTimeAPI = Date.now()

            if(req[0].lang === "fr") {

                message.followUp(`**${endTime - startTime < 300 ? bot.function.emojis.ping1 : endTime - startTime < 500 ? bot.function.emojis.ping2 : bot.function.emojis.ping3} \`Latence du robot\` : ${endTime - startTime}ms\n${bot.ws.ping < 300 ? bot.function.emojis.ping1 : bot.ws.ping < 500 ? bot.function.emojis.ping2 : bot.function.emojis.ping3} \`Latence de l'API de Discord\` : ${bot.ws.ping}ms\n${endTimeDB - startTimeDB < 5 ? bot.function.emojis.ping1 : endTimeDB - startTimeDB < 10 ? bot.function.emojis.ping2 : bot.function.emojis.ping3} \`Latence de la base de données\` : ${endTimeDB - startTimeDB}ms\n${endTimeAPI - startTimeAPI < 20 ? bot.function.emojis.ping1 : endTimeAPI - startTimeAPI < 50 ? bot.function.emojis.ping2 : bot.function.emojis.ping3} \`Latence de l'API du robot\` : ${endTimeAPI - startTimeAPI}ms**`)
            }

            if(req[0].lang === "en") {

                message.followUp(`**${endTime - startTime < 300 ? bot.function.emojis.ping1 : endTime - startTime < 500 ? bot.function.emojis.ping2 : bot.function.emojis.ping3} \`Latency of the bot\` : ${endTime - startTime}ms\n${bot.ws.ping < 300 ? bot.function.emojis.ping1 : bot.ws.ping < 500 ? bot.function.emojis.ping2 : bot.function.emojis.ping3} \`Latency of the Discord's API\` : ${bot.ws.ping}ms\n${endTimeDB - startTimeDB < 5 ? bot.function.emojis.ping1 : endTimeDB - startTimeDB < 10 ? bot.function.emojis.ping2 : bot.function.emojis.ping3} \`Lantency of the database\` : ${endTimeDB - startTimeDB}ms\n${endTimeAPI - startTimeAPI < 20 ? bot.function.emojis.ping1 : endTimeAPI - startTimeAPI < 50 ? bot.function.emojis.ping2 : bot.function.emojis.ping3} \`Latency of the bot's API\` : ${endTimeAPI - startTimeAPI}ms**`)
            }
        })
    }
})
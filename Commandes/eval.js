const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "eval",
    description: ["Permet de tester un code", "Allow to test a code"],
    utilisation: ["[code]", "[code]"],
    permission: "Développeur",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Système", "System"],
    cooldown: 2,
    options: [
        {
            type: "string",
            name: ["code", "code"],
            description: ["Le code à tester", "The code to test"],
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)

        let code = args.getString("code")
        if(!code) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un code !" : "Please indicate a code !"))

        try {

            let result = await eval(code)
            if(typeof result !== "string") result = await require("util").inspect(result, {depth: 0})
            if(result.includes("`")) result = result.replace(/`/g, "\\`")

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`${bot.function.emojis.system} ${req[0].lang === "fr" ? "Evaluation d'un code" : "Evaluation of a code"}`)
            .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
            .addFields([{name: req[0].lang === "fr" ? "Code envoyé" : "Sent code", value: `\`\`\`js\n${code}\`\`\``}, {name: req[0].lang === "fr" ? "Code reçu" : "Received code", value: `\`\`\`js\n${result}\`\`\``}])
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            await message.reply({embeds: [Embed]})

        } catch (err) {

            result = err;

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`${bot.function.emojis.system} ${req[0].lang === "fr" ? "Evaluation d'un code" : "Evaluation of a code"}`)
            .setThumbnail(bot.user.displayAvatarURL({dynamic: true}))
            .addFields([{name: req[0].lang === "fr" ? "Code oyé" : "Sent code", value: `\`\`\`js\n${code}\`\`\``}, {name: req[0].lang === "fr" ? "Code reçu" : "Received code", value: `\`\`\`js\n${result}\`\`\``}])
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            await message.reply({embeds: [Embed]})
        }
    }
})
const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "clear",
    description: ["Permet de supprimer un certains nombre de message", "Allow to delete a certain number of messages"],
    utilisation: ["[nombre de message]", "[number of message]"],
    permission: Discord.PermissionFlagsBits.ManageMessages,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageMessages],
    category: ["Modération", "Moderation"],
    cooldown: 5,
    options: [
        {
            type: "number",
            name: ["nombre", "number"],
            description: ["Le nombre de message à supprimer", "The number of message to delete"],
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)

        let number = args._hoistedOptions[0].value;
        if(!number) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un nombre entre \`0\` et \`100\` inclus !" : "Please enter a number between \`0\` and \`100\` inclusive !"))
        if(isNaN(number)) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un nombre entre \`0\` et \`100\` inclus !" : "Please enter a number between \`0\` and \`100\` inclusive !"))
        if(parseInt(number) < 0 || parseInt(number) > 100) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un nombre entre \`0\` et \`100\` inclus !" : "Please enter a number between \`0\` and \`100\` inclusive !"))

        await message.deferReply()

        try {

            let msgtodelete = [...(await message.channel.messages.fetch({before: message.id})).filter(msg => msg.id !== message.id).values()].slice(0, parseInt(number))
            if(msgtodelete.length <= 0) return message.followUp(lang.error(req[0].lang === "fr" ? "Aucun message à supprimer !" : "No message to delete !"))
            await message.channel.bulkDelete(msgtodelete)
                        
            await message.followUp(lang.clear(req[0].lang === "fr" ? `Le robot a supprimé un total de \`${msgtodelete.length}\` message(s) avec succès !` : `The robot deleted a total of \`${msgtodelete.length}\` message(s) with success !`))
            setTimeout(async () => { await message.deleteReply() }, 5000)

            await bot.emit("messageClear", message.user, message.channel, msgtodelete.length)

        } catch (err) {

            let msgtodelete = [...(await message.channel.messages.fetch({before: message.id})).filter(msg => msg.id !== message.id && (Date.now() - msg.createdAt) <= 1209600000).values()].slice(0, parseInt(number))
            if(msgtodelete.length <= 0) return message.followUp(lang.error(req[0].lang === "fr" ? "Les messages datent de plus de 14 jours !" : "The messages are over 14 days old!"))
            await message.channel.bulkDelete(msgtodelete)

            await message.followUp(lang.clear(req[0].lang === "fr" ? `Le robot a supprimé un total de \`${msgtodelete.length}\` message(s) car les autres datent de plus de 14 jours avec succès !` : `The robot deleted a total of \`${msgtodelete.length}\` message(s) because the others are more than 14 days old with success !`))
            setTimeout(async () => { await message.deleteReply() }, 5000)

            await bot.emit("messageClear", message.user, message.channel, msgtodelete.length)
        }
    }
})
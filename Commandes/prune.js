const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "prune",
    description: ["Permet de supprimer un certains nombre de message d'un utilisateur", "Allow to delete a certain number of messages of a user"],
    utilisation: ["[membre] [nombre de messages]", "[member] [number of message]"],
    permission: Discord.PermissionFlagsBits.ManageMessages,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageMessages],
    category: ["Modération", "Moderation"],
    cooldown: 5,
    options: [
        {
            type: "user",
            name: ["membre", "member"],
            description: ["L'utilisateur à qui vous voulez supprimer les messages", "The user to whom you want to delete messages"],
            required: true,
            autocomplete: false
        }, {
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

        try {

            let user = await bot.users.fetch(args._hoistedOptions[0].value)
            if(!user) return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))

            let number = args._hoistedOptions[1].value;
            if(!number) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un nombre entre \`0\` et \`100\` inclus !" : "Please enter a number between \`0\` and \`100\` inclusive !"))
            if(isNaN(number)) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un nombre entre \`0\` et \`100\` inclus !" : "Please enter a number between \`0\` and \`100\` inclusive !"))
            if(parseInt(number) < 0 || parseInt(number) > 100) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un nombre entre \`0\` et \`100\` inclus !" : "Please enter a number between \`0\` and \`100\` inclusive !"))

            let messages = [...(await message.channel.messages.fetch({before: message.id})).filter(m => m.author.id === user.id).values()].slice(0, parseInt(number));
            if(messages.length <= 0) return message.reply(lang.error(req[0].lang === "fr" ? `\`${user.tag}\` n'a envoyé aucun message dans ce salon !` : `\`${user.tag}\` didn't send message in this channel !`))

            await message.deferReply()

            try {
                
                let msg = await message.channel.bulkDelete(messages)

                await message.followUp(lang.clear(req[0].lang === "fr" ? `Le robot a supprimé un total de \`${msg.size}\` message(s) de \`${user.tag}\` avec succès !` : `The robot deleted a total of \`${msg.size}\` message(s) of \`${user.tag}\` with success !`))
                setTimeout(async () => { message.deleteReply() }, 5000)

                await bot.emit("guildMemberMessagesClear", message.user, message.channel, user, msg.size)

            } catch (err) {

                let msgtodelete = [...(await message.channel.messages.fetch({before: message.id})).filter(m => m.author.id === user.id && (Date.now() - m.createdAt) <= 1209600000).values()].slice(0, parseInt(number));
                if(msgtodelete.length <= 0) return message.followUp(lang.error(req[0].lang === "fr" ? "Les messages datent de plus de 14 jours !" : "The messages are over 14 days old!"))
                await message.channel.bulkDelete(msgtodelete)

                await message.followUp(lang.clear(req[0].lang === "fr" ? `Le robot a supprimé un total de \`${msgtodelete.length}\` message(s) de \`${user.tag}\` car les autres datent de plus de 14 jours avec succès !` : `The robot deleted a total of \`${msgtodelete.length}\` message(s) of \`${user.tag}\` because the others are more than 14 days old with success !`))
                setTimeout(async () => { message.deleteReply() }, 5000)

                await bot.emit("guildMemberMessagesClear", message.user, message.channel, user, msgtodelete.size)
            }

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
        }
    }
})
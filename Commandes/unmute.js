const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "unmute",
    description: ["Permet de rendre la parole à un utilisateur", "Allow to unmute a user"],
    utilisation: ["[membre] (raison)", "[member] (reason)"],
    permission: Discord.PermissionFlagsBits.ModerateMembers,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ModerateMembers],
    category: ["Modération", "Moderation"],
    cooldown: 5,
    options: [
        {
            type: "user",
            name: ["membre", "member"],
            description: ["Le membre à qui rendre la parole", "The member to unmute"],
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: ["raison", "reason"],
            description: ["La raison de la parole rendu", "The reason of the unmute"],
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)

        try {

            let user = await bot.users.fetch(args._hoistedOptions[0].value)
            if(!user) return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
            let member = message.guild.members.cache.get(user.id)
            if(!member) return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))

            let reason = args.getString("reason")
            if(!reason) reason = req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified";

            if(message.user.id === user.id) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas vous rendre votre propre parole !" : "You can't unmute yourself !"))
            if((await message.guild.fetchOwner()).id === user.id) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas rendre la parole du propriétaire du serveur !" : "You can't unmute the server's owner !"))
            if(message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas rendre la parole de cette personne !" : "You can't unmute this person !"))
            if(!member.moderatable) return message.reply(lang.error(req[0].lang === "fr" ? "Le robot ne peut pas rendre la parole de cette personne !" : "The robot can't unmute this person !"))
            if(!member.isCommunicationDisabled()) return message.reply(lang.error(req[0].lang === "fr" ? "Cette personne a déjà sa parole !" : "This person is already unmute !"))

            try {
                await user.send(lang.unmute(req[0].lang === "fr" ? `Votre parole vous a été rendu sur le serveur \`${message.guild.name}\` par \`${message.user.tag}\` ! ${bot.function.emojis.complete}` : `You have been unmuted on the server \`${message.guild.name}\` by \`${message.user.tag}\` ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason))
            } catch (err) { }

            await message.reply(lang.unmute(req[0].lang === "fr" ? `${message.user} a rendu la parole de \`${user.tag}\` avec succès ! ${bot.function.emojis.complete}` : `${message.user} unmuted \`${user.tag}\` with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason))

            await member.timeout(null, `${reason} (${req[0].lang === "fr" ? "Parole rendu par" : "Unmuted by"} ${message.user.tag})`)
        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
        }
    }
})
const Discord = require("discord.js")
const ms = require("ms")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "mute",
    description: ["Permet de rendre temporairement muet un utilisateur", "Allow to temporarily mute a user"],
    utilisation: ["[membre] [temps] (raison)", "[member] [time] (reason)"],
    permission: Discord.PermissionFlagsBits.ModerateMembers,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ModerateMembers],
    category: ["Modération", "Moderation"],
    cooldown: 5,
    options: [
        {
            type: "user",
            name: ["membre", "member"],
            description: ["Le membre à rendre muet", "The member to mute"],
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: ["temps", "time"],
            description: ["Le temps du muet", "The time of the mute"],
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: ["raison", "reason"],
            description: ["La raison du muet", "The reason of the mute"],
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

            await message.deferReply()

            let time = args.getString("time")
            if(!time) return message.followUp(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un temps avec le bon format \`d\` pour jour, \`h\` pour heure, \`m\` pour minute et \`s\` pour seconde !" : "Please enter a time with the correct format \`d\` for day, \`h\` for hour, \`m\` for minute and \`s\` for second !"))
            if(isNaN(ms(time))) return message.followUp(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un temps avec le bon format \`d\` pour jour, \`h\` pour heure, \`m\` pour minute et \`s\` pour seconde !" : "Please enter a time with the correct format \`d\` for day, \`h\` for hour, \`m\` for minute and \`s\` for second !"))
            if(ms(time) > 2419200000) return message.followUp(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un temps inférieur à 28 jours !" : "Please indicate a time less than 28 days !"))

            let reason = args.getString("reason")
            if(!reason) reason = req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified";

            if(message.user.id === user.id) return message.followUp(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas vous rendre muet vous-même !" : "You can't mute yourself !"))
            if((await message.guild.fetchOwner()).id === user.id) return message.followUp(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas rendre muet le propriétaire du serveur !" : "You can't mute the server's owner !"))
            if(message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.followUp(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas rendre muet cette personne !" : "You can't mute this person !"))
            if(!member.moderatable) return message.followUp(lang.error(req[0].lang === "fr" ? "Le robot ne peut pas rendre muet cette personne !" : "The robot can't mute this person !"))
            if(member.isCommunicationDisabled()) return message.followUp(lang.error(req[0].lang === "fr" ? "Cette personne est déjà muette !" : "This person is already mute !"))

            let ID = await bot.function.createID("MUTE")

            try {
                await user.send(lang.mute(req[0].lang === "fr" ? `Vous avez été rendu muet sur le serveur \`${message.guild.name}\` pendant \`${time}\` par \`${message.user.tag}\` ! ${bot.function.emojis.cancel}` : `You have been muted on the server \`${message.guild.name}\` for \`${time}\` by \`${message.user.tag}\` ! ${bot.function.emojis.cancel}`) + "\n" + lang.reason(reason))
            } catch (err) { }

            await db.insert("mutes", ["ID", "guildID", "userID", "authorID", "muteID", "reason", "time", "date"], [`${message.guildId} ${user.id}`, message.guildId, user.id, message.user.id, ID, reason.replace(/'/g, "\\'"), time, `${Date.now()}`])

            const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Danger)
            .setLabel(req[0].lang === "fr" ? "Rendre la parole" : "Unmute")
            .setCustomId(`unmute_${user.id}`))

            await message.followUp({ content: lang.mute(req[0].lang === "fr" ? `${message.user} a rendu muet \`${user.tag}\` pendant \`${time}\` avec succès ! ${bot.function.emojis.complete}` : `${message.user} muted \`${user.tag}\` for \`${time}\` with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason), components: [btn] })
            await member.timeout(Math.floor(ms(time)), `${reason} (${req[0].lang === "fr" ? "Rendu muet par" : "Muted by"} ${message.user.tag})`)

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
        }
    }
})
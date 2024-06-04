const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "kick",
    description: ["Permet d'expulser un utilisateur", "Allow to kick a user"],
    utilisation: ["[membre] (raison)", "[member] (reason)"],
    permission: Discord.PermissionFlagsBits.KickMembers,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageMessages, Discord.PermissionFlagsBits.KickMembers],
    category: ["Modération", "Moderation"],
    cooldown: 5,
    options: [
        {
            type: "user",
            name: ["membre", "member"],
            description: ["Le membre à expulser", "The member to kick"],
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: ["raison", "reason"],
            description: ["La raison de l'expulsion", "The reason of the kick"],
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

            let reason = args.getString("reason")
            if(!reason) reason = req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified";

            if(message.user.id === user.id) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas vous expulser vous-même !" : "You can't kick yourself !"))
            if((await message.guild.fetchOwner()).id === user.id) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas expulser le propriétaire du serveur !" : "You can't kick the server's owner !"))
            if(message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas expulser cette personne !" : "You can't kick this person !"))
            if((await message.guild.members.fetchMe()).roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.reply(lang.error(req[0].lang === "fr" ? "Le robot ne peut pas expulser cette personne !" : "The robot can't kick this person !"))

            let ID = await bot.function.createID("KICK")

            try {
                await user.send(lang.kick(req[0].lang === "fr" ? `Vous avez été expulsé du serveur \`${message.guild.name}\` par \`${message.user.tag}\` ! ${bot.function.emojis.cancel}` : `You have been kicked of the server \`${message.guild.name}\` by \`${message.user.tag}\` ! ${bot.function.emojis.cancel}`) + "\n" + lang.reason(reason))
            } catch (err) { }

            db.insert("kicks", ["ID", "guildID", "userID", "authorID", "kickID", "reason", "date"], [`${message.guildId} ${user.id}`, message.guildId, user.id, message.user.id, ID, reason.replace(/'/g, "\\'"), `${Date.now()}`])

            await message.followUp(lang.kick(req[0].lang === "fr" ? `${message.user} a expulsé \`${user.tag}\` avec succès ! ${bot.function.emojis.complete}` : `${message.user} kicked \`${user.tag}\` with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason))

            await member.kick(`${reason} (${req[0].lang === "fr" ? "Expulsé par" : "Kicked by"} ${message.user.tag})`)
            await bot.emit("guildMemberKick", member, message.user, ID, reason)

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
        }
    }
})
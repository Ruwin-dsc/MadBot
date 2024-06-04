const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "warn",
    description: ["Permet d'avertir un utilisateur", "Allow to warn a user"],
    utilisation: ["[membre] (raison)", "[member] (reason)"],
    permission: Discord.PermissionFlagsBits.ManageMessages,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Modération", "Moderation"],
    cooldown: 10,
    options: [
        {
            type: "user",
            name: ["membre", "member"],
            description: ["Le membre à avertir", "The member to warn"],
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: ["raison", "reason"],
            description: ["La raison de l'avertissement", "The reason of the warn"],
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

            if(message.user.id === user.id) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas vous avertir vous-même !" : "You can't warn yourself !"))
            if((await message.guild.fetchOwner()).id === user.id) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas avertir le propriétaire du serveur !" : "You can't warn the server's owner !"))
            if(message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas avertir cette personne !" : "You can't warn this person !"))
            if((await message.guild.members.fetchMe()).roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.reply(lang.error(req[0].lang === "fr" ? "Le robot ne peut pas avertir cette personne !" : "The robot can't warn this person !"))

            let ID = await bot.function.createID("WARN")

            try {
                await user.send(lang.warn(req[0].lang === "fr" ? `Vous avez été averti sur le serveur \`${message.guild.name}\` par \`${message.user.tag}\` ! ${bot.function.emojis.cancel}` : `You have been warned on the server \`${message.guild.name}\` by \`${message.user.tag}\` ! ${bot.function.emojis.cancel}`) + "\n" + lang.reason(reason))
            } catch (err) { }

            db.insert("warns", ["ID", "guildID", "userID", "authorID", "warnID", "reason", "date"], [`${message.guildId} ${user.id}`, message.guildId, user.id, message.user.id, ID, reason.replace(/'/g, "\\'"), `${Date.now()}`])

            await message.reply(lang.warn(req[0].lang === "fr" ? `${message.user} a averti \`${user.tag}\` avec succès ! ${bot.function.emojis.complete}` : `${message.user} warned \`${user.tag}\` with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason))
            await bot.emit("guildMemberWarn", member, message.user, ID, reason)

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
        }
    }
})
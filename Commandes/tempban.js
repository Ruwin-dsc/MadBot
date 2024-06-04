const Discord = require("discord.js")
const ms = require("ms")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "tempban",
    description: ["Permet de bannir temporairement un utilisateur", "Allow to ban temporarily a user"],
    utilisation: ["[membre] [temps] (raison)", "[member] [time] (reason)"],
    permission: Discord.PermissionFlagsBits.BanMembers,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.BanMembers],
    category: ["Modération", "Moderation"],
    cooldown: 5,
    options: [
        {
            type: "user",
            name: ["membre", "member"],
            description: ["Le membre à bannir", "The member to ban"],
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: ["temps", "time"],
            description: ["Le temps du bannissement", "The time of the ban"],
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: ["raison", "reason"],
            description: ["La raison du bannissement", "The reason of the ban"],
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

            let time = args.getString("time");
            if(!time) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un temps avec le bon format \`d\` pour jour, \`h\` pour heure, \`m\` pour minute et \`s\` pour seconde !" : "Please enter a time with the correct format \`d\` for day, \`h\` for hour, \`m\` for minute and \`s\` for second !"))
            if(isNaN(ms(time))) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un temps avec le bon format \`d\` pour jour, \`h\` pour heure, \`m\` pour minute et \`s\` pour seconde !" : "Please enter a time with the correct format \`d\` for day, \`h\` for hour, \`m\` for minute and \`s\` for second !"))

            let reason = args.getString("reason")
            if(!reason) reason = req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified";

            if(message.user.id === user.id) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas vous bannir vous-même !" : "You can't ban yourself !"))
            if((await message.guild.fetchOwner()).id === user.id) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas bannir le propriétaire du serveur !" : "You can't ban the server's owner !"))
            if(member && message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.reply(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas bannir cette personne !" : "You can't ban this person !"))
            if(member && !member.bannable) return message.reply(lang.error(req[0].lang === "fr" ? "Le robot ne peut pas bannir cette personne !" : "The robot can't ban this person !"))
            if((await message.guild.bans.fetch()).get(user.id)) return message.reply(lang.error(req[0].lang === "fr" ? "Cette personne est déjà bannie !" : "This person is already banned !"))

            let ID = await bot.function.createID("BAN")

            try {
                await user.send(lang.ban(req[0].lang === "fr" ? `Vous avez été banni du serveur \`${message.guild.name}\` pendant \`${time}\` par \`${message.user.tag}\` ! ${bot.function.emojis.cancel}` : `You have been banned of the server \`${message.guild.name}\` for \`${time}\` by \`${message.user.tag}\` ! ${bot.function.emojis.cancel}`) + "\n" + lang.reason(reason))
            } catch (err) { }

            db.insert("bans", ["ID", "guildID", "userID", "authorID", "banID", "reason", "time", "date"], [`${message.guildId} ${user.id}`, message.guildId, user.id, message.user.id, ID, reason.replace(/'/g, "\\'"), time, `${Date.now()}`])
            db.insert("temp", ["ID", "guildID", "userID", "banID", "date"], [`${message.guildId} ${user.id}`, message.guildId, user.id, ID, Date.now() + ms(time)])

            const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Danger)
            .setLabel(req[0].lang === "fr" ? "Débannir" : "Unban")
            .setCustomId(`unban_${user.id}`))

            await message.reply({ content: lang.ban(req[0].lang === "fr" ? `${message.user} a banni \`${user.tag}\` pendant \`${time}\` avec succès ! ${bot.function.emojis.complete}` : `${message.user} banned \`${user.tag}\` for \`${time}\` with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason), components: [btn] })
            await message.guild.bans.create(user.id, { reason: `${reason} (${req[0].lang === "fr" ? "Banni par" : "Banned by"} ${message.user.tag})` })

            let ban = await db.select("temp", "ID", `${message.guildId} ${user.id}`)
            if(ban.length > 1) await db.delete("temp", "ID", `${message.guildId} ${user.id}`)

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
        }
    }
})
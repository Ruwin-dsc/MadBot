const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "ban",
    description: ["Permet de bannir définitivement un utilisateur", "Allow to ban definitively a user"],
    utilisation: ["[membre] (raison)", "[member] (reason)"],
    alias: ["ban"],
    permission: Discord.PermissionFlagsBits.BanMembers,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.BanMembers],
    category: ["Modération", "Moderation"],
    cooldown: 5,
    options: [
        {
            type: "user",
            name: ["membre", "member"],
            description: ["Le membre à bannir", "The member to ban"],
            required: true
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

            await message.deferReply()

            let user = await bot.users.fetch(args._hoistedOptions[0].value)
            if(!user) return message.followUp(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
            let member = message.guild.members.cache.get(user.id)

            let reason = args.getString("reason")
            if(!reason) reason = req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified";

            if(message.user.id === user.id) return message.followUp(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas vous bannir vous-même !" : "You can't ban yourself !"))
            if((await message.guild.fetchOwner()).id === user.id) return message.followUp(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas bannir le propriétaire du serveur !" : "You can't ban the server's owner !"))
            if(member && message.member.roles.highest.comparePositionTo(member.roles.highest) <= 0) return message.followUp(lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas bannir cette personne !" : "You can't ban this person !"))
            if(member && !member.bannable) return message.followUp(lang.error(req[0].lang === "fr" ? "Le robot ne peut pas bannir cette personne !" : "The robot can't ban this person !"))
            if((await message.guild.bans.fetch()).get(user.id)) return message.followUp(lang.error(req[0].lang === "fr" ? "Cette personne est déjà bannie !" : "This person is already banned !"))

            let ID = await bot.function.createID("BAN")

            try {
                await user.send(lang.ban(req[0].lang === "fr" ? `Vous avez été banni du serveur \`${message.guild.name}\` par \`${message.user.tag}\` ! ${bot.function.emojis.cancel}` : `You have been banned of the server \`${message.guild.name}\` by \`${message.user.tag}\` ! ${bot.function.emojis.cancel}`) + "\n" + lang.reason(reason))
            } catch (err) { }

            db.insert("bans", ["ID", "guildID", "userID", "authorID", "banID", "reason", "time", "date"], [`${message.guildId} ${user.id}`, message.guildId, user.id, message.user.id, ID, reason.replace(/'/g, "\\'"), req[0].lang === "fr" ? "Définitif" : "Definitive", `${Date.now()}`])

            const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Danger)
            .setLabel(req[0].lang === "fr" ? "Débannir" : "Unban")
            .setCustomId(`unban_${user.id}`))

            await message.followUp({ content: lang.ban(req[0].lang === "fr" ? `${message.user} a banni \`${user.tag}\` avec succès ! ${bot.function.emojis.complete}` : `${message.user} banned \`${user.tag}\` with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason), components: [btn] })

            await message.guild.bans.create(user.id, { reason: `${reason} (${req[0].lang === "fr" ? "Banni par" : "Banned by"} ${message.user.tag})`, deleteMessageDays: 7 })

        } catch (err) {

            return message.followUp(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
        }
    }
})
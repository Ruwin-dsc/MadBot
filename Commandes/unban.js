const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "unban",
    description: ["Permet de débannir un utilisateur", "Allow to unban a user"],
    utilisation: ["[identifiant du membre] (raison)", "[member ID] (reason)"],
    permission: Discord.PermissionFlagsBits.BanMembers,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.BanMembers],
    category: ["Modération", "Moderation"],
    cooldown: 5,
    options: [
        {
            type: "string",
            name: ["identifiant", "id"],
            description: ["L'identifiant du membre à débannir", "The member ID to unban"],
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: ["raison", "reason"],
            description: ["La raison du débannissement", "The reason of the unban"],
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

            let reason = args.getString("reason")
            if(!reason) reason = req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified";

            if(!(await message.guild.bans.fetch()).get(user.id)) return message.reply(lang.error(req[0].lang === "fr" ? "Cette personne n'est pas bannie !" : "This person is not banned !"))

            try {
                await user.send(lang.unban(req[0].lang === "fr" ? `Vous avez été débanni du serveur \`${message.guild.name}\` par \`${message.user.tag}\` ! ${bot.function.emojis.complete}` : `You have been unbanned of the server \`${message.guild.name}\` by \`${message.user.tag}\` ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason))
            } catch (err) { }
            await message.reply(lang.unban(req[0].lang === "fr" ? `${message.user} a débanni \`${user.tag}\` avec succès ! ${bot.function.emojis.complete}` : `${message.user} unbanned \`${user.tag}\` with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason))

            await message.guild.members.unban(user.id, `${reason} (${req[0].lang === "fr" ? "Débanni par" : "Unbanned by"} ${message.user.tag})`)

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
        }
    }
})
const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "delete",
    description: ["Permet de supprimer une infraction d'un utilisateur", "Allow to delete a offense of a user"],
    utilisation: ["[identifiant de l'infraction] (raison)", "[ID of the offense] (reason)"],
    permission: Discord.PermissionFlagsBits.ManageMessages,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageMessages],
    category: ["Modération", "Moderation"],
    cooldown: 5,
    options: [
        {
            type: "string",
            name: ["identifiant", "id"],
            description: ["L'identifiant de l'infraction", "The ID of the offense"],
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: ["raison", "reason"],
            description: ["La raison du la suppresion de l'infraction", "The reason of the delete of the offense"],
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)

        let ID = args.getString("id")
        if(!ID) return message.reply(lang.error(req[0].lang === "fr" ? "Aucune infraction trouvée !" : "No offense found !"))

        let reason = args.getString("reason")
        if(!reason) reason = req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified";

        let sanction = await db.select(`${ID.split("-")[0].toLowerCase()}s`, `${ID.split("-")[0].toLowerCase()}ID`, ID)

        if(sanction.length < 1) return message.reply(lang.error(req[0].lang === "fr" ? "Aucune infraction trouvée !" : "No offense found !"))
        if(sanction[0].guildID !== message.guildId) return message.reply(lang.error(req[0].lang === "fr" ? "Aucune infraction trouvée !" : "No offense found !"))

        db.delete(`${ID.split("-")[0].toLowerCase()}s`, `${ID.split("-")[0].toLowerCase()}ID`, ID)

        try {
            (await bot.users.fetch(sanction[0].userID)).send(lang[ID.split("-")[0].toLowerCase()](req[0].lang === "fr" ? `\`${message.user.tag}\` vous a supprimé votre ${ID.split("-")[0].toLowerCase() === "ban" ? "bannissement" : ID.split("-")[0].toLowerCase() === "kick" ? "expulsion" : ID.split("-")[0].toLowerCase() === "mute" ? "muet" : "avertissement"} \`${sanction[0][`${ID.split("-")[0].toLowerCase()}ID`]}\` avec succès ! ${bot.function.emojis.complete}` : `\`${message.user.tag}\` removed your ${ID.split("-")[0].toLowerCase()} \`${sanction[0][`${ID.split("-")[0].toLowerCase()}ID`]}\` with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason))
        } catch (err) { }
        await message.reply(lang[ID.split("-")[0].toLowerCase()](req[0].lang === "fr" ? `${message.user} a supprimé ${ID.split("-")[0].toLowerCase() === "ban" ? "le bannissement" : ID.split("-")[0].toLowerCase() === "kick" ? "l'expulsion" : ID.split("-")[0].toLowerCase() === "mute" ? "le muet" : "l'avertissement"} \`${sanction[0][`${ID.split("-")[0].toLowerCase()}ID`]}\` de \`${(await bot.users.fetch(sanction[0].userID)).tag}\` avec succès ! ${bot.function.emojis.complete}` : `${message.user} removed the ${ID.split("-")[0].toLowerCase()} \`${sanction[0][`${ID.split("-")[0].toLowerCase()}ID`]}\` of \`${(await bot.users.fetch(sanction[0].userID)).tag}\` with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason))
        await bot.emit("guildMemberOffenseDelete", message.guild.members.cache.get(sanction[0].userID), message.user, ID, reason)
    }
})
const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "checkstatus",
    description: ["Permet de connaître les utilisateurs ayant un lien de serveur Discord dans leur status personnalisé", "Allow to get the users who have a Discord server link in their custom status"],
    utilisation: ["", ""],
    permission: Discord.PermissionFlagsBits.ManageMessages,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Modération", "Moderation"],
    cooldown: 5,

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = bot.function[req[0].lang]

        let members = message.guild.members.cache.filter(m => m.presence?.status !== "invisible" && m.presence?.status !== "offline" && m.presence?.activities[0]?.type === 4 && m.presence?.activities[0]?.state?.match(new RegExp(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g)))
        if(members.size <= 0) return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne n'a d'invitation Discord dans sont statut personnalisé !" : "No one has a Discord invite in their custom status !"))

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle(`${bot.function.emojis.emoji} ${req[0].lang === "fr" ? "Liste des utilisateurs ayant un statut personnalisé avec une invitation Discord" : "List of users with a Discord invite custom status"}`)
        .setThumbnail(message.user.displayAvatarURL({ dynamic: true }))
        .setDescription(members.map(m => `${m.user} : \`${m.presence?.activities[0].state}\``).join("\n"))
        .setTimestamp()
        .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

        await message.reply({embeds: [Embed]})
    }
})
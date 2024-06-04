const Discord = require("discord.js")
const { time } = require("@discordjs/builders")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "role",
    description: ["Permet d'avoir des informations sur un rôle", "Allow to get informations about a role"],
    utilisation: ["(rôle)", "(role)"],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Informations", "Informations"],
    cooldown: 2,
    options: [
        {
            type: "role",
            name: ["rôle", "role"],
            description: ["Le rôle à afficher", "The role to display"],
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = bot.function[req[0].lang]

        let role;
        if(args._hoistedOptions.length > 0) {
            role = message.guild.roles.cache.get(args._hoistedOptions[0].value)
            if(!role) return message.reply(lang.error(req[0].lang === "fr" ? "Aucun rôle trouvé !" : "No role found !"))
        } else role = message.member.roles.highest;

        await message.deferReply()

        if(req[0].lang === "fr") {

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`${bot.function.emojis.role} Informations sur le rôle ${role.name}`)
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
            .addFields([{name: `${bot.function.emojis.arrow} **__Informations sur le rôle__**`, value: `> ${bot.function.emojis.role} **Nom** : \`${role.name}\` ${role}\n> ${bot.function.emojis.id} **Identifiant** : \`${role.id}\`\n> ${bot.function.emojis.color} **Couleur** : \`${role.hexColor}\`\n> ${bot.function.emojis.position} **Position** : \`${role.rawPosition} / ${message.guild.roles.cache.size}\`\n> ${bot.function.emojis.creation_account} **Date de création** : ${time(role.createdAt, "F")} \`(il y a ${((Date.now() - role.createdAt) / 86400000).toFixed(0)} ${(Date.now() - role.createdAt) / 86400000 <= 1 ? "jour" : "jours"})\``}, {name: `${bot.function.emojis.arrow} **__Informations sur les permissions__**`, value: `> ${bot.function.emojis.robot} **Rôle de robot** : \`${role.managed ? "Oui" : "Non"}\`\n> ${bot.function.emojis.mention} **Mentionnable** : \`${role.mentionable ? "Oui" : "Non"}\`\n> ${bot.function.emojis.permission} **Permissions** : ${role.permissions.toArray().map(p => `\`${p}\``).join(" ")}`}])
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            message.followUp({ embeds: [Embed] })
        }

        if(req[0].lang === "en") {

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`${bot.function.emojis.role} Informations about the role ${role.name}`)
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
            .addFields([{name: `${bot.function.emojis.arrow} **__Informations about the role__**`, value: `> ${bot.function.emojis.role} **Name** : \`${role.name}\` ${role}\n> ${bot.function.emojis.id} **ID** : \`${role.id}\`\n> ${bot.function.emojis.color} **Color** : \`${role.hexColor}\`\n> ${bot.function.emojis.position} **Position** : \`${role.rawPosition} / ${message.guild.roles.cache.size}\`\n> ${bot.function.emojis.creation_account} **Creation date** : ${time(role.createdAt, "F")} \`(there are ${((Date.now() - role.createdAt) / 86400000).toFixed(0)} ${(Date.now() - role.createdAt) / 86400000 <= 1 ? "day" : "days"})\``}, {name: `${bot.function.emojis.arrow} **__Informations about the permissions__**`, value: `> ${bot.function.emojis.robot} **Bot's role** : \`${role.managed ? "Yes" : "No"}\`\n> ${bot.function.emojis.mention} **Mentionnable** : \`${role.mentionable ? "Yes" : "No"}\`\n> ${bot.function.emojis.permission} **Permissions** : ${role.permissions.toArray().map(p => `\`${p}\``).join(" ")}`}])
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            message.followUp({ embeds: [Embed] })
        }
    }
})
const Discord = require("discord.js")
const { time } = require("@discordjs/builders")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "channel",
    description: ["Permet d'avoir des informations sur un salon", "Allow to get informations about a channel"],
    utilisation: ["(salon)", "(channel)"],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Informations", "Informations"],
    cooldown: 2,
    options: [
        {
            type: "channel",
            name: ["salon", "channel"],
            description: ["Le salon à afficher", "The channel to display"],
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)

        try {

            let channel;
            if(args._hoistedOptions.length > 0) {
                channel = await bot.channels.fetch(args._hoistedOptions[0].value)
                if(!channel) return message.reply(lang.error(req[0].lang === "fr" ? "Aucun salon trouvé !" : "No channel found !"))
            } else channel = message.channel;

            await message.deferReply()

            let cooldown = channel.rateLimitPerUser === 0 ? req[0].lang === "fr" ? "Non" : "No" : `${Math.floor(channel.rateLimitPerUser / 1000)} seconde(s)`;

            if(req[0].lang === "fr") {

                let Embed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.channel} Informations sur le salon ${channel.name}`)
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.arrow} **__Informations sur le salon__**`, value: `> ${bot.function.emojis.channel} **Nom** : \`${channel.name}\` ${channel}\n> ${bot.function.emojis.id} **Identifiant** : \`${channel.id}\`\n> ${channel.type === 0 ? bot.function.emojis.channel : channel.type === 2 ? bot.function.emojis.voice : channel.type === 4 ? bot.function.emojis.category : channel.type === 5 ? bot.function.emojis.announcement : channel.type === 13 ? bot.function.emojis.stage : channel.type === 15 ? bot.function.emojis.forum : channel.type === 11 || channel.type === 12 ? bot.function.emojis.thread : channel.type === 15 ? bot.function.emojis.forum : bot.function.emojis.channel} **Type** : \`${channel.type === 0 ? "Textuel" : channel.type === 2 ? "Vocal" : channel.type === 4 ? "Catégorie" : channel.type === 5 ? "Annonce" : channel.type === 13 ? "Stage" : channel.type === 15 ? "Forum" : channel.type === 11 || channel.type === 12 ? "Thread" : channel.type === 15 ? "Forum" : "Inconnu"}\`\n> ${bot.function.emojis.nickname} **Description** : \`${channel.topic ? channel.topic : "Aucune"}\`\n> ${bot.function.emojis.position} **Position** : \`${channel.rawPosition ? channel.rawPosition : 0} / ${message.guild.channels.cache.size}\`\n> ${bot.function.emojis.nsfw} **NSFW** : \`${channel.nsfw ? "Oui" : "Non"}\`\n> ${channel.rateLimitPerUser > 0 ? bot.function.emojis.slowmode : bot.function.emojis.unslowmode} **Ralentissement** : \`${cooldown}\`\n> ${bot.function.emojis.creation_account} **Date de création** : ${time(channel.createdAt, "F")} \`(il y a ${((Date.now() - channel.createdAt) / 86400000).toFixed(0)} ${(Date.now() - channel.createdAt) / 86400000 <= 1 ? "jour" : "jours"})\``}, {name: `${bot.function.emojis.arrow} **__Informations sur les permissions__**`, value: `> ${bot.function.emojis.role} **Nombre de rôles** : \`${channel.permissionOverwrites ? channel.permissionOverwrites.cache.filter(p => p.type === "role").size : 0}\`\n> ${bot.function.emojis.user} **Nombre d'utilisateurs** : \`${channel.permissionOverwrites ? channel.permissionOverwrites.cache.filter(p => p.type === "user").size : 0}\``}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                message.followUp({ embeds: [Embed] })
            }

            if(req[0].lang === "en") {

                let Embed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.channel} Informations about the channel ${channel.name}`)
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.arrow} **__Informations about the channel__**`, value: `> ${bot.function.emojis.channel} **Name** : \`${channel.name}\` ${channel}\n> ${bot.function.emojis.id} **ID** : \`${channel.id}\`\n> ${channel.type === 0 ? bot.function.emojis.channel : channel.type === 2 ? bot.function.emojis.voice : channel.type === 4 ? bot.function.emojis.category : channel.type === 5 ? bot.function.emojis.announcement : channel.type === 13 ? bot.function.emojis.stage : channel.type === 15 ? bot.function.emojis.forum : channel.type === 11 || channel.type === 12 ? bot.function.emojis.thread : channel.type === 15 ? bot.function.emojis.forum : bot.function.emojis.channel} **Type** : \`${channel.type === 0 ? "Textual" : channel.type === 2 ? "Voice" : channel.type === 4 ? "Category" : channel.type === 5 ? "Announcement" : channel.type === 13 ? "Stage" : channel.type === 15 ? "Forum" : channel.type === 11 || channel.type === 12 ? "Thread" : channel.type === 15 ? "Forum" : "Unknow"}\`\n> ${bot.function.emojis.nickname} **Description** : \`${channel.topic ? channel.topic : "No"}\`\n> ${bot.function.emojis.position} **Position** : \`${channel.rawPosition ? channel.rawPosition : 0} / ${message.guild.channels.cache.size}\`\n> ${bot.function.emojis.nsfw} **NSFW** : \`${channel.nsfw ? "Yes" : "No"}\`\n> ${channel.rateLimitPerUser > 0 ? bot.function.emojis.slowmode : bot.function.emojis.unslowmode} **Slowmode** : \`${cooldown}\`\n> ${bot.function.emojis.creation_account} **Creation date** : ${time(channel.createdAt, "F")} \`(there are ${((Date.now() - channel.createdAt) / 86400000).toFixed(0)} ${(Date.now() - channel.createdAt) / 86400000 <= 1 ? "day" : "days"})\``}, {name: `${bot.function.emojis.arrow} **__Informations about the permissions__**`, value: `> ${bot.function.emojis.role} **Number of roles** : \`${channel.permissionOverwrites ? channel.permissionOverwrites.cache.filter(p => p.type === "role").size : 0}\`\n> ${bot.function.emojis.user} **Number of user** : \`${channel.permissionOverwrites ? channel.permissionOverwrites.cache.filter(p => p.type === "user").size : 0}\``}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                message.followUp({ embeds: [Embed] })
            }

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucun salon trouvé !" : "No channel found !"))
        }
    }
})
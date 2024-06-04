const Discord = require("discord.js")
const { time } = require("@discordjs/builders")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "server",
    description: ["Permet d'avoir des informations sur un serveur", "Allow to get informations about a server"],
    utilisation: ["(identifiant du serveur)", "(server ID)"],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Informations", "Informations"],
    cooldown: 2,
    options: [
        {
            type: "string",
            name: ["serveur", "server"],
            description: ["Le serveur à afficher", "The server to display"],
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = bot.function[req[0].lang]

        // try {

            let guild;
            if(args._hoistedOptions.length > 0) {
                guild = await bot.guilds.fetch(args._hoistedOptions[0].value)
                if(!guild) return message.reply(lang.error(req[0].lang === "fr" ? "Aucun serveur trouvé !" : "No server found !"))
            } else guild = message.guild;

            let nbonline = 0;
            let nbdnd = 0;
            let nbstreaming = 0;
            let nbidle = 0;
            let nboffline = 0;
            let nbbot = 0;

            guild.presences.cache.forEach(m => m.status === "online" ? nbonline = nbonline + 1 : m.status === "dnd" ? nbdnd = nbdnd + 1 : m.status === "streaming" ? nbstreaming = nbstreaming + 1 : m.status === "idle" ? nbidle = nbidle + 1 : "")
            guild.members.cache.forEach(m => m.user.bot ? nbbot = nbbot + 1 : "")
            nboffline = guild.memberCount - (nbonline + nbdnd + nbstreaming + nbidle)

            let badge = guild.verified ? bot.function.emojis.verified : "";
            if(guild.partnered) badge += bot.function.emojis.partnered;


            await message.deferReply()

            if(req[0].lang === "fr") {

                if(badge === "") badge = "\`Aucun\`"

                let Embed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.server} Informations sur le serveur ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.arrow} **__Informations sur le serveur__**`, value: `> ${bot.function.emojis.server} **Nom** : \`${guild.name}\`\n> ${bot.function.emojis.id} **Identifiant** : \`${guild.id}\`\n> ${bot.function.emojis.nickname} **Description** : \`${guild.description === null ? "Aucune" : guild.description}\`\n> ${bot.function.emojis.owner} **Propriétaire** : \`${await (await bot.users.fetch((await guild.fetchOwner()).id)).tag}\` ${await bot.users.fetch((await guild.fetchOwner()).id)}\n> ${guild.premiumTier === 0 ? bot.function.emojis.tier0 : guild.premiumTier === 1 ? bot.function.emojis.tier1 : guild.premiumTier === 2 ? bot.function.emojis.tier2 : guild.premiumTier === 3 ? bot.function.emojis.tier3 : ""} **Nombre de boost(s)** : \`${guild.premiumSubscriptionCount} (tier ${guild.premiumTier})\`\n> ${bot.function.emojis.badge} **Badge** : ${badge}\n> ${bot.function.emojis.creation_account} **Date de création** : ${time(guild.createdAt, "F")} \`(il y a ${((Date.now() - guild.createdAt) / 86400000).toFixed(0)} ${((Date.now() - guild.createdAt) / 86400000).toFixed(0) === 0 ? "jour" : "jours"})\`\n> ${bot.function.emojis.certified_moderator} **Protection** : \`${guild.verificationLevel === 0 ? "Aucune" : guild.verificationLevel === 1 ? "Faible" : guild.verificationLevel === 2 ? "Moyenne" : guild.verificationLevel === 3 ? "Haute" : "Très haute"}\``}, {name: `${bot.function.emojis.arrow} **__Informations sur les membres__**`, value: `> ${bot.function.emojis.online} **En ligne** : \`${nbonline}\`\n> ${bot.function.emojis.dnd} **Ne pas déranger** : \`${nbdnd}\`\n> ${bot.function.emojis.streaming} **En stream** : \`${nbstreaming}\`\n> ${bot.function.emojis.idle} **Inactif** : \`${nbidle}\`\n> ${bot.function.emojis.offline} **Hors-ligne** : \`${nboffline}\`\n> ${bot.function.emojis.robot} **Robot** : \`${nbbot}\`\n> ${bot.function.emojis.user} **Total de membres** : \`${guild.memberCount}/${guild.maximumMembers}\``}, {name: `${bot.function.emojis.arrow} **__Informations sur les salons spéciaux__**`, value: `> ${bot.function.emojis.rules} **Règlement** : ${guild.rulesChannelId === null ? "\`Aucun\`" : await guild.channels.fetch(guild.rulesChannelId)}\n> ${bot.function.emojis.voice} **AFK** : ${guild.afkChannelId === null ? "\`Aucun\`" : await guild.channels.fetch(guild.afkChannelId)}`}, {name: `${bot.function.emojis.arrow} **__Informations sur les statistiques__**`, value: `> ${bot.function.emojis.category} **Catégorie** : \`${await (await guild.channels.fetch()).filter(c => c.type === 4).size}\`\n> ${bot.function.emojis.stage} **Stage** : \`${await (await guild.channels.fetch()).filter(c => c.type === 13).size}\`\n> ${bot.function.emojis.forum} **Forum** : \`${await (await guild.channels.fetch()).filter(c => c.type === 15).size}\`\n> ${bot.function.emojis.announcement} **Annonce** : \`${await (await guild.channels.fetch()).filter(c => c.type === 5).size}\`\n> ${bot.function.emojis.voice} **Vocal** : \`${await (await guild.channels.fetch()).filter(c => c.type === 2).size}\`\n> ${bot.function.emojis.channel} **Textuel** : \`${await (await guild.channels.fetch()).filter(c => c.type === 0).size}\`\n> ${bot.function.emojis.channel} **Total** : \`${await (await guild.channels.fetch()).size}\`\n> ${bot.function.emojis.role} **Rôles** : \`${await (await guild.roles.fetch()).size}\`\n> ${bot.function.emojis.emoji} **Emojis** : \`${await (await guild.emojis.fetch()).size}\``}])
                .setImage(guild.bannerURL({ dynamic: true, size: 4096 }))
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                message.followUp({ embeds: [Embed] })
            }

            if(req[0].lang === "en") {

                if(badge === "") badge = "\`No\`"

                let Embed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.server} Informations about the server ${guild.name}`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.arrow} **__Informations about the server__**`, value: `> ${bot.function.emojis.server} **Name** : \`${guild.name}\`\n> ${bot.function.emojis.id} **ID** : \`${guild.id}\`\n> ${bot.function.emojis.nickname} **Description** : \`${guild.description === null ? "No" : guild.description}\`\n> ${bot.function.emojis.owner} **Owner** : \`${await (await bot.users.fetch((await guild.fetchOwner()).id)).tag}\` ${await bot.users.fetch((await guild.fetchOwner()).id)}\n> ${guild.premiumTier === 0 ? bot.function.emojis.tier0 : guild.premiumTier === 1 ? bot.function.emojis.tier1 : guild.premiumTier === 2 ? bot.function.emojis.tier2 : guild.premiumTier === 3 ? bot.function.emojis.tier3 : ""} **Boost number** : \`${guild.premiumSubscriptionCount} (tier ${guild.premiumTier})\`\n> ${bot.function.emojis.badge} **Badge** : ${badge}\n> ${bot.function.emojis.creation_account} **Creation date** : ${time(guild.createdAt, "F")} \`(there are ${((Date.now() - guild.createdAt) / 86400000).toFixed(0)} ${((Date.now() - guild.createdAt) / 86400000).toFixed(0) === 0 ? "day" : "days"})\`\n> ${bot.function.emojis.certified_moderator} **Protection** : \`${guild.verificationLevel === 0 ? "No" : guild.verificationLevel === 1 ? "Low" : guild.verificationLevel === 2 ? "Medium" : guild.verificationLevel === 3 ? "High" : "Very high"}\``}, {name: `${bot.function.emojis.arrow} **__Informations about the members__**`, value: `> ${bot.function.emojis.online} **Online** : \`${nbonline}\`\n> ${bot.function.emojis.dnd} **Do not disturb** : \`${nbdnd}\`\n> ${bot.function.emojis.streaming} **Streaming** : \`${nbstreaming}\`\n> ${bot.function.emojis.idle} **Idle** : \`${nbidle}\`\n> ${bot.function.emojis.offline} **Offline** : \`${nboffline}\`\n> ${bot.function.emojis.robot} **Bot** : \`${nbbot}\`\n> ${bot.function.emojis.user} **All members** : \`${guild.memberCount}/${guild.maximumMembers}\``}, {name: `${bot.function.emojis.arrow} **__Informations about the specials channels__**`, value: `> ${bot.function.emojis.rules} **Rules** : ${guild.rulesChannelId === null ? "\`No\`" : await guild.channels.fetch(guild.rulesChannelId)}\n> ${bot.function.emojis.voice} **AFK** : ${guild.afkChannelId === null ? "\`No\`" : await guild.channels.fetch(guild.afkChannelId)}`}, {name: `${bot.function.emojis.arrow} **__Informations about the statisics__**`, value: `> ${bot.function.emojis.category} **Category** : \`${await (await guild.channels.fetch()).filter(c => c.type === 4).size}\`\n> ${bot.function.emojis.stage} **Stage** : \`${await (await guild.channels.fetch()).filter(c => c.type === 13).size}\`\n> ${bot.function.emojis.forum} **Forum** : \`${await (await guild.channels.fetch()).filter(c => c.type === 15).size}\`\n> ${bot.function.emojis.announcement} **News** : \`${await (await guild.channels.fetch()).filter(c => c.type === 5).size}\`\n> ${bot.function.emojis.voice} **Voice** : \`${await (await guild.channels.fetch()).filter(c => c.type === 2).size}\`\n> ${bot.function.emojis.channel} **Textual** : \`${await (await guild.channels.fetch()).filter(c => c.type === 0).size}\`\n> ${bot.function.emojis.channel} **Total** : \`${await (await guild.channels.fetch()).size}\`\n> ${bot.function.emojis.role} **Roles** : \`${await (await guild.roles.fetch()).size}\`\n> ${bot.function.emojis.emoji} **Emojis** : \`${await (await guild.emojis.fetch()).size}\``}])
                .setImage(guild.bannerURL({ dynamic: true, size: 4096 }))
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                message.followUp({ embeds: [Embed] })
            }

        // } catch (err) { return message.reply(lang.error(req[0].lang === "fr" ? "Aucun serveur trouvé !" : "No server found !")) }
    }
})
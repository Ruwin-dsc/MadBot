const Discord = require("discord.js")
const Event = require("../../Structure/Event")

module.exports = new Event("guildMemberUpdate", async (bot, oldMember, newMember) => {

    let logs = await bot.db.selectLogs(newMember.guild.id)
    let req = await bot.db.selectGuild(newMember.guild.id)

    if(!oldMember.isCommunicationDisabled() && newMember.isCommunicationDisabled()) {

        if(!logs[0].enable.includes("guildMemberMute") || req[0].channellogs === "off") return;

        const fetchGuildAuditLogs = await newMember.guild.fetchAuditLogs({
            limit: 1,
            type: 24
        })

        const latestMemberMuted = fetchGuildAuditLogs.entries.first();
        const { executor } = latestMemberMuted;

        if(executor.id === bot.user.id) {

            let m = await bot.db.select("mutes", "guildID", newMember.guild.id)

            let unmutter = newMember.guild.members.cache.find(m => m.user.discriminator === latestMemberMuted.reason.split(req[0].lang === "fr" ? "(Rendu muet par " : "(Muted by ")[1].replace(")", "").split("#")[1] && m.user.username === latestMemberMuted.reason.split(req[0].lang === "fr" ? "(Rendu muet par " : "(Muted by ")[1].replace(")", "").split("#")[0]).user;
            let muteID = m.filter(r => r.authorID === unmutter.id).sort((a, b) => parseInt(b.date) - parseInt(a.date))[0];

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`${bot.function.emojis.timeout} ${req[0].lang === "fr" ? "Muet d'un utilisateur" : "Mute of a user"}`)
            .setThumbnail((await latestMemberMuted.target.fetch()).displayAvatarURL({ dynamic: true }))
            .setDescription(`${bot.function.emojis.user} **Utilisateur** : ${latestMemberMuted.target}\n${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${unmutter}\n${bot.function.emojis.id} **${req[0].lang === "fr" ? "Identifiant" : "ID"}** : \`${muteID.muteID}\`\n${bot.function.emojis.time} **${req[0].lang === "fr" ? "Durée" : "Time"}** : \`${muteID.time}\`\n${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${muteID.reason}\``)
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            try {
                await (await bot.channels.fetch(req[0].channellogs)).send({ embeds: [Embed] })
            } catch (err) { }

        } else {

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`${bot.function.emojis.timeout} ${req[0].lang === "fr" ? "Muet d'un utilisateur" : "Mute of a user"}`)
            .setThumbnail((await latestMemberMuted.target.fetch()).displayAvatarURL({ dynamic: true }))
            .setDescription(`${bot.function.emojis.user} **Utilisateur** : ${latestMemberMuted.target}\n${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${executor}\n${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${latestMemberMuted.reason ? latestMemberMuted.reason : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``)
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            try {
                await (await bot.channels.fetch(req[0].channellogs)).send({ embeds: [Embed] })
            } catch (err) { }
        }
    }

    if(oldMember.isCommunicationDisabled() && !newMember.isCommunicationDisabled()) {

        if(!logs[0].enable.includes("guildMemberUnmute") || req[0].channellogs === "off") return;

        const fetchGuildAuditLogs = await newMember.guild.fetchAuditLogs({
            limit: 1,
            type: 24
        })

        const latestMemberUnmuted = fetchGuildAuditLogs.entries.first();
        const { executor } = latestMemberUnmuted;

        if(executor.id === bot.user.id) {

            let m = await bot.db.select("mutes", "guildID", newMember.guild.id)

            let unmutter = newMember.guild.members.cache.find(m => m.user.discriminator === latestMemberUnmuted.reason.split(req[0].lang === "fr" ? "(Parole rendu par " : "(Unmuted by ")[1].replace(")", "").split("#")[1] && m.user.username === latestMemberUnmuted.reason.split(req[0].lang === "fr" ? "(Parole rendu par " : "(Unmuted by ")[1].replace(")", "").split("#")[0]).user;

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`${bot.function.emojis.untimeout} ${req[0].lang === "fr" ? "Parole rendu d'un utilisateur" : "Unmute of a user"}`)
            .setThumbnail((await latestMemberUnmuted.target.fetch()).displayAvatarURL({ dynamic: true }))
            .setDescription(`${bot.function.emojis.user} **Utilisateur** : ${latestMemberUnmuted.target}\n${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${unmutter}\n${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${latestMemberUnmuted.reason.split(req[0].lang === "fr" ? " (Parole rendu par " : " (Unmuted by ")[0]}\``)
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            try {
                await (await bot.channels.fetch(req[0].channellogs)).send({ embeds: [Embed] })
            } catch (err) { }

        } else {

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`${bot.function.emojis.untimeout} ${req[0].lang === "fr" ? "Parole rendu d'un utilisateur" : "Unmute of a user"}`)
            .setThumbnail((await latestMemberUnmuted.target.fetch()).displayAvatarURL({ dynamic: true }))
            .setDescription(`${bot.function.emojis.user} **Utilisateur** : ${latestMemberUnmuted.target}\n${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${executor}\n${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${latestMemberUnmuted.reason ? latestMemberUnmuted.reason : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``)
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            try {
                await (await bot.channels.fetch(req[0].channellogs)).send({ embeds: [Embed] })
            } catch (err) { }
        }
    }
})
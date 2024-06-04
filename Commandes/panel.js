const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "panel",
    description: ["Permet de configurer le serveur", "Allow to configure the server"],
    utilisation: ["", ""],
    permission: Discord.PermissionFlagsBits.ManageGuild,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageMessages],
    category: ["Configuration", "Configuration"],
    cooldown: 10,

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        let logs = await db.selectLogs(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)

        const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Success)
        .setCustomId(`general_${message.user.id}`)
        .setEmoji("926867863329980477")
        .setLabel(req[0].lang === "fr" ? "Général" : "General"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Success)
        .setCustomId(`moderation_${message.user.id}`)
        .setEmoji("901527981086867526")
        .setLabel(req[0].lang === "fr" ? "Modération" : "Moderation"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Success)
        .setCustomId(`protection_${message.user.id}`)
        .setEmoji("952146313938608168")
        .setLabel(req[0].lang === "fr" ? "Protection" : "Protection"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Success)
        .setCustomId(`xp_${message.user.id}`)
        .setEmoji("895961667853254696")
        .setLabel(req[0].lang === "fr" ? "Expérience" : "Experience"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId(`cancel_${message.user.id}`)
        .setLabel('X')
        .setLabel(req[0].lang === "fr" ? "Annuler" : "Cancel"))

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
        .setThumbnail(message.guild.iconURL({ dynamic: true }))
        .addFields([{name: `${bot.function.emojis.prefix} **__${req[0].lang === "fr" ? "Général" : "General"}__**`, value: `> ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk} **${req[0].lang === "fr" ? "Langue" : "Language"}** : ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk}`}, {name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : \`${logs[0].enable === "" ? 0 : logs[0].enable.split(" ").length}\` ${bot.function.emojis.on} \`${logs[0].disable === "" ? 0 : logs[0].disable.split(" ").length}\` ${bot.function.emojis.off}`}, {name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}, {name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
        .setTimestamp()
        .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

        await message.reply({ embeds: [Embed], components: [btn] })

        const filter = async () => true;
        const collector = (await message.fetchReply()).createMessageComponentCollector({ filter, time: 120000 })

        collector.on("collect", async button => {

            if(button.user.id !== message.user.id) return message.reply({ content: lang.error(req[0].lang === "fr" ? "Vous n'êtes pas l'auteur du message !" : "You aren't the author of the message !"), ephemeral: true })

            let events = "";
            let allevent = [];
            logs[0].enable === "" ? "" : logs[0].enable.split(" ").forEach(async e => allevent.push(e))
            logs[0].disable === "" ? "" : logs[0].disable.split(" ").forEach(async e => allevent.push(e))
            await allevent.sort()
            allevent.forEach(async event => {
                if(logs[0].enable.split(" ").includes(event)) events += `\n> \`${event}\` ${bot.function.emojis.on}`;
                else events += `\n> \`${event}\` ${bot.function.emojis.off}`;
            })

            if(button.customId.startsWith("general")) {

                const newbtn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`language_${message.user.id}`)
                .setEmoji(req[0].lang === "fr" ? "926874704218828830" : "926874738054266891")
                .setLabel(req[0].lang === "fr" ? "Langue" : "Language"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId(`cancel_${message.user.id}`)
                .setLabel('X')
                .setLabel(req[0].lang === "fr" ? "Annuler" : "Cancel"))

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.prefix} **__${req[0].lang === "fr" ? "Général" : "General"}__**`, value: `> ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk} **${req[0].lang === "fr" ? "Langue" : "Language"}** : ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await button.deferUpdate()
                await message.editReply({ embeds: [newEmbed], components: [newbtn] })
            }

            if(button.customId.startsWith("language")) {

                try {

                    let filterm = m => m.user.id === message.user.id;
                    const menu = new Discord.ActionRowBuilder().addComponents(new Discord.SelectMenuBuilder()
                    .setCustomId("menu")
                    .setPlaceholder(req[0].lang === "fr" ? "Choisissez parmis les choix ci-dessous..." : "Choose from the choices below...")
                    .setMaxValues(1)
                    .setMinValues(1)
                    .addOptions([{ label: "Français", description: "Permet de changer la langue du serveur en français", value: "fr", emoji: "926874704218828830" }, { label: "English", description: "Allow to change the lang of the server in english", value: "en", emoji: "926874738054266891" }]));

                    await button.reply({ content: bot.function[req[0].lang][req[0].lang]((req[0].lang === "fr" ? `Veuillez choisir une des langues ci-dessous... ${bot.function.emojis.loading}` : `Please choose one of the languages ​​below... ${bot.function.emojis.loading}`)), components: [menu], ephemeral: true })
                    let choice = await (await button.fetchReply()).awaitMessageComponent({ filterm, time: 30000, max: 1, errors: [`time`] });
                    if(req[0].lang === choice.values[0]) return button.editReply({ content: lang.error(req[0].lang === "fr" ? "La langue du serveur est déjà en français !" : "The lang of the server is already in english !"), components: [], ephemeral: true })

                    req[0].lang = choice.values[0];
                    await db.update("serveur", "lang", choice.values[0], "guildID", message.guildId)
                    await button.editReply({ content: bot.function[choice.values[0]][choice.values[0]](req[0].lang === "fr" ? `La langue du serveur a été changée en français avec succès ! ${bot.function.emojis.complete}` : `The lang of the server has been changed in english with success ! ${bot.function.emojis.complete}`), components: [], ephemeral: true })

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                    .setThumbnail(message.guild.iconURL({ dynamic: true }))
                    .addFields([{name: `${bot.function.emojis.prefix} **__${req[0].lang === "fr" ? "Général" : "General"}__**`, value: `> ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk} **${req[0].lang === "fr" ? "Langue" : "Language"}** : ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk}`}, {name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : \`${logs[0].enable === "" ? 0 : logs[0].enable.split(" ").length}\` ${bot.function.emojis.on} \`${logs[0].disable === "" ? 0 : logs[0].disable.split(" ").length}\` ${bot.function.emojis.off}`}, {name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}, {name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    await message.editReply({ embeds: [newEmbed], components: [btn] })

                } catch (err) {

                    return button.editReply({ content: lang.error(req[0].lang === "fr" ? "Vous avez mis trop de temps pour répondre à la question !" : "You took too long to answer the question !"), components: [], ephemeral: true })
                }
            }

            if(button.customId.startsWith("moderation")) {

                const newbtn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`state_moderation_${message.user.id}`)
                .setEmoji("934482694031679560")
                .setLabel(req[0].lang === "fr" ? "Etat" : "State"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`logs_${message.user.id}`)
                .setEmoji("934805408873336882")
                .setLabel("Logs"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`events_${message.user.id}`)
                .setEmoji("938111908781908059")
                .setLabel("Events"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId(`cancel_${message.user.id}`)
                .setLabel('X')
                .setLabel(req[0].lang === "fr" ? "Annuler" : "Cancel"))

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : ${events}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await button.deferUpdate()
                await message.editReply({ embeds: [newEmbed], components: [newbtn] })
            }

            if(button.customId.startsWith("state")) {

                let type = button.customId.split("_")[1] === "xp" ? "experience" : button.customId.split("_")[1];

                const newbtn = new Discord.ActionRowBuilder().addComponents(req[0][type] === "off" ? new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId(`enable_${type}_${message.user.id}`)
                .setEmoji("934475700864426066")
                .setLabel(req[0].lang === "fr" ? "Activer" : "Enable") :
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId(`disable_${type}_${message.user.id}`)
                .setEmoji("934475730954379304")
                .setLabel(req[0].lang === "fr" ? "Désactiver" : "Disable"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId(`cancel_${message.user.id}`)
                .setLabel('X')
                .setLabel(req[0].lang === "fr" ? "Annuler" : "Cancel"))

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                type === "moderation" ? newEmbed.addFields([{name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : ${events}`}]) : newEmbed.addFields([{name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await button.deferUpdate()
                await message.editReply({ embeds: [newEmbed], components: [newbtn] })
            }

            if(button.customId.startsWith("logs")) {

                const newbtn = new Discord.ActionRowBuilder().addComponents(req[0].channellogs === "off" ? new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId(`enable_logs_${message.user.id}`)
                .setEmoji("934475700864426066")
                .setLabel(req[0].lang === "fr" ? "Activer" : "Enable") :
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`switch_logs_${message.user.id}`)
                .setEmoji("885185368440320041")
                .setLabel(req[0].lang === "fr" ? "Changer le salon des logs" : "Change the channel logs"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId(`disable_logs_${message.user.id}`)
                .setEmoji("934475730954379304")
                .setLabel(req[0].lang === "fr" ? "Désactiver" : "Disable"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId(`cancel_${message.user.id}`)
                .setLabel('X')
                .setLabel(req[0].lang === "fr" ? "Annuler" : "Cancel"))

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : ${events}`}]).setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await button.deferUpdate()
                await message.editReply({ embeds: [newEmbed], components: [newbtn] })
            }

            if(button.customId.includes("events")) {

                try {

                    const menu = new Discord.ActionRowBuilder().addComponents(new Discord.SelectMenuBuilder()
                    .setMinValues(0)
                    .setMaxValues(allevent.length)
                    .setPlaceholder(req[0].lang === "fr" ? "Choisissez parmis les choix ci-dessous..." : "Choose from the choices below...")
                    .setCustomId("menu")
                    .addOptions([{ label: "channelLock", value: "channelLock", emoji: "933743590956490812", description: req[0].lang === "fr" ? "Permet d'avoir les logs des salons verrouillés" : "Allow to get logs of the locked channels" }, { label: "channelUnlock", value: "channelUnlock", emoji: "933743608429940796", description: req[0].lang === "fr" ? "Permet d'avoir les logs des salons déverrouillés" : "Allow to get logs of the unlocked channels" }, { label: "channelSlowmode", value: "channelSlowmode", emoji: "932307486927634512", description: req[0].lang === "fr" ? "Permet d'avoir les logs des salons ralentis" : "Allow to get logs of the slowed channels" }, { label: "guildMemberBan", value: "guildMemberBan", emoji: "914158468661936149", description: req[0].lang === "fr" ? "Permet d'avoir les logs des membres bannis" : "Allow to get logs of the banned members" }, { label: "guildMemberUnban", value: "guildMemberUnban", emoji: "914160091433943112", description: req[0].lang === "fr" ? "Permet d'avoir les logs des membres débannis" : "Allow to get logs of the unbanned members" }, { label: "guildMemberKick", value: "guildMemberKick", emoji: "926400324820942848", description: req[0].lang === "fr" ? "Permet d'avoir les logs des membres expulsés" : "Allow to get logs of the kicked members" }, { label: "guildMemberMute", value: "guildMemberMute", emoji: "1011586468717793310", description: req[0].lang === "fr" ? "Permet d'avoir les logs des membres muets" : "Allow to get logs of the muted members" }, { label: "guildMemberUnmute", value: "guildMemberUnmute", emoji: "1011586470542323712", description: req[0].lang === "fr" ? "Permet d'avoir les logs des membres avec parole" : "Allow to get logs of the unmuted members" }, { label: "guildMemberWarn", value: "guildMemberWarn", emoji: "914161912332304475", description: req[0].lang === "fr" ? "Permet d'avoir les logs des membres avertis" : "Allow to get logs of the warned members" }, { label: "guildMemberOffenseDelete", value: "guildMemberOffenseDelete", emoji: "926406627266027561", description: req[0].lang === "fr" ? "Permet d'avoir les logs des infractions supprimés" : "Allow to get logs of the deleted offenses" }, { label: "messageClear", value: "messageClear", emoji: "926844050143842314", description: req[0].lang === "fr" ? "Permet d'avoir les logs des suppresions de messages" : "Allow to get logs of the deleted messages" }, { label: "guildMemberMessagesClear", value: "guildMemberMessagesClear", emoji: "926844050143842314", description: req[0].lang === "fr" ? "Permet d'avoir les logs des messages supprimés d'un utilisateur" : "Allow to get logs of the deleted messages of a user"}]))

                    let filterm = m => m.user.id === message.user.id;
                    await button.reply({ content: lang.events((req[0].lang === "fr" ? `Veuillez choisir une ou plusieurs logs ci-dessous... ${bot.function.emojis.loading}` : `Please choose one or several of the logs ​​below... ${bot.function.emojis.loading}`)), components: [menu], ephemeral: true })
                    let choice = await (await button.fetchReply()).awaitMessageComponent({ filterm, time: 30000, max: 1, errors: [`time`] });

                    await choice.values.sort()
                    let disableevent = allevent.filter(e => !choice.values.includes(e))
                    let enableevent = choice.values;
                    let dejaevent = logs[0].enable === "" ? [] : logs[0].enable.split(" ");

                    if(dejaevent === enableevent) return button.editReply({ content: lang.error(req[0].lang === "fr" ? "Vous ne pouvez pas sélectionner les mêmes events !" : "You can't select the same events !"), ephemeral: true, components: [] })
                    await db.update("logs", "enable", enableevent.join(" "), "guildID", message.guildId)
                    await db.update("logs", "disable", disableevent.join(" "), "guildID", message.guildId)
                    logs[0].enable = enableevent.join(" ");
                    logs[0].disable = disableevent.join(" ");
                    await button.editReply({ content: lang.events(req[0].lang === "fr" ? `Les events ${enableevent.map(e => `\`${e}\``).join(" ")} ont été activés avec succès ! ${bot.function.emojis.complete}` : `The events ${enableevent.map(e => `\`${e}\``).join(" ")} have been enabled with success ! ${bot.function.emojis.complete}`), ephemeral: true, components: [] })

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                    .setThumbnail(message.guild.iconURL({ dynamic: true }))
                    .addFields([{name: `${bot.function.emojis.prefix} **__${req[0].lang === "fr" ? "Général" : "General"}__**`, value: `> ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk} **${req[0].lang === "fr" ? "Langue" : "Language"}** : ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk}`}, {name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : \`${logs[0].enable === "" ? 0 : logs[0].enable.split(" ").length}\` ${bot.function.emojis.on} \`${logs[0].disable === "" ? 0 : logs[0].disable.split(" ").length}\` ${bot.function.emojis.off}`}, {name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}, {name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    await message.editReply({ embeds: [newEmbed], components: [btn] })

                } catch (err) {

                    return button.editReply({ content: lang.error(req[0].lang === "fr" ? "Vous avez mis trop de temps pour répondre à la question !" : "You took too long to answer the question !"), components: [], ephemeral: true })
                }
            }

            if(button.customId.startsWith("protection")) {

                const newbtn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`captcha_${message.user.id}`)
                .setEmoji("952146313938608168")
                .setLabel("Captcha"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`role_captcha_${message.user.id}`)
                .setEmoji("885860288165978132")
                .setLabel(req[0].lang === "fr" ? "Rôle" : "Role"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId(`cancel_${message.user.id}`)
                .setLabel('X')
                .setLabel(req[0].lang === "fr" ? "Annuler" : "Cancel"))

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await button.deferUpdate()
                await message.editReply({ embeds: [newEmbed], components: [newbtn] })
            }

            if(button.customId.startsWith("captcha")) {

                const newbtn = new Discord.ActionRowBuilder().addComponents(req[0].captcha === "off" ? new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId(`enable_captcha_${message.user.id}`)
                .setEmoji("934475700864426066")
                .setLabel(req[0].lang === "fr" ? "Activer" : "Enable") :
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`switch_captcha_${message.user.id}`)
                .setEmoji("885185368440320041")
                .setLabel(req[0].lang === "fr" ? "Changer le salon du captcha" : "Change the channel captcha"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId(`disable_captcha_${message.user.id}`)
                .setEmoji("934475730954379304")
                .setLabel(req[0].lang === "fr" ? "Désactiver" : "Disable"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId(`cancel_${message.user.id}`)
                .setLabel('X')
                .setLabel(req[0].lang === "fr" ? "Annuler" : "Cancel"))

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await button.deferUpdate()
                await message.editReply({ embeds: [newEmbed], components: [newbtn] })
            }

            if(button.customId.startsWith("role_captcha")) {

                const newbtn = new Discord.ActionRowBuilder().addComponents(req[0].captcharole === "off" ? new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId(`enable_role_captcha_${message.user.id}`)
                .setEmoji("934475700864426066")
                .setLabel(req[0].lang === "fr" ? "Activer" : "Enable") :
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`switch_role_captcha_${message.user.id}`)
                .setEmoji("885860288165978132")
                .setLabel(req[0].lang === "fr" ? "Changer le rôle du captcha" : "Change the role captcha"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId(`disable_role_captcha_${message.user.id}`)
                ("934475730954379304")
                .setLabel(req[0].lang === "fr" ? "Désactiver" : "Disable"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId(`cancel_${message.user.id}`)
                .setLabel('X')
                .setLabel(req[0].lang === "fr" ? "Annuler" : "Cancel"))

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await button.deferUpdate()
                await message.editReply({ embeds: [newEmbed], components: [newbtn] })
            }

            if(button.customId.startsWith("xp")) {

                const newbtn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`state_xp_${message.user.id}`)
                .setEmoji("934482694031679560")
                .setLabel(req[0].lang === "fr" ? "Etat" : "State"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`channel_${message.user.id}`)
                .setEmoji("885185368440320041")
                .setLabel(req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId(`cancel_${message.user.id}`)
                .setLabel('X')
                .setLabel(req[0].lang === "fr" ? "Annuler" : "Cancel"))

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await button.deferUpdate()
                await message.editReply({ embeds: [newEmbed], components: [newbtn] })
            }

            if(button.customId.startsWith("channel")) {

                const newbtn = new Discord.ActionRowBuilder().addComponents(req[0].channelexperience === "off" ? new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId(`enable_channel_${message.user.id}`)
                .setEmoji("934475700864426066")
                .setLabel(req[0].lang === "fr" ? "Activer" : "Enable") :
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId(`switch_channel_${message.user.id}`)
                .setEmoji("885185368440320041")
                .setLabel(req[0].lang === "fr" ? "Changer le salon de notifications" : "Change the channel notification"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId(`disable_channel_${message.user.id}`)
                .setEmoji("934475730954379304")
                .setLabel(req[0].lang === "fr" ? "Désactiver" : "Disable"),
                new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId(`cancel_${message.user.id}`)
                .setLabel('X')
                .setLabel(req[0].lang === "fr" ? "Annuler" : "Cancel"))

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await button.deferUpdate()
                await message.editReply({ embeds: [newEmbed], components: [newbtn] })
            }

            if(button.customId.startsWith("enable_logs") || button.customId.startsWith("switch_logs") || button.customId.startsWith("enable_channel") || button.customId.startsWith("switch_channel") || button.customId.startsWith("enable_captcha") || button.customId.startsWith("switch_captcha")) {

                try {

                    let type = button.customId.includes("logs") ? "logs" : button.customId.includes("captcha") ? "captcha" : "xp";
                    let filterm = m => m.user.id === message.user.id;
                    let components = [];

                    if(message.guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildText).size > 25) {

                        let count = Math.floor(message.guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildText).size / 25) + 1;
                        let number = 0;
                        menu = new Discord.ActionRowBuilder()
                        for(let i = 0; i < count; i++) {
                            let options = [];
                            for(let i2 = number; i2 < ((number + 25) > message.guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildText).size ? message.guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildText).size : (number + 25)); i2++) {
                                let channel = [...message.guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildText).values()].sort((a, b) => a.rawPosition - b.rawPosition)[i2];
                                options.push({ value: channel.id, label: `# ${channel.name}`, description: channel.parent?.name })
                            }
                            const menu = new Discord.ActionRowBuilder().addComponents(new Discord.SelectMenuBuilder()
                            .setCustomId("menu" + i + 1)
                            .setPlaceholder(req[0].lang === "fr" ? "Choisissez parmis les choix ci-dessous..." : "Choose from the choices below...")
                            .setMaxValues(1)
                            .setMinValues(1)
                            .addOptions(options))
                            components.push(menu)
                            number += 25;
                        }

                    } else {

                        let options = [];
                        await message.guild.channels.cache.filter(c => c.type === Discord.ChannelType.GuildText).sort((a, b) => a.rawPosition - b.rawPosition).forEach(async channel => {
                            options.push({ value: channel.id, label: `# ${channel.name}`, description: channel.parent?.name})
                        })
                        const menu = new Discord.ActionRowBuilder().addComponents(new Discord.SelectMenuBuilder()
                        .setCustomId("menu")
                        .setPlaceholder(req[0].lang === "fr" ? "Choisissez parmis les choix ci-dessous..." : "Choose from the choices below...")
                        .setMaxValues(1)
                        .setMinValues(1)
                        .addOptions(options))
                        components.push(menu)
                    }

                    await button.reply({ content: lang[type]((req[0].lang === "fr" ? `Veuillez choisir un des salons ci-dessous... ${bot.function.emojis.loading}` : `Please choose one of the channels ​​below... ${bot.function.emojis.loading}`)), components: components, ephemeral: true })
                    let choice = await (await button.fetchReply()).awaitMessageComponent({ filterm, time: 30000, max: 1, errors: [`time`] });
                    if(req[0][type === "xp" ? "channelexperience" : type === "captcha" ? "captcha" : "channellogs"] === choice.values[0]) return button.editReply({ content: lang.error(req[0].lang === "fr" ? `Le salon de ${type === "xp" ? "notifications" : type === "captcha" ? "captcha" : "logs"} est déjà ${message.guild.channels.cache.get(choice.values[0])} !` : `The channel ${type === "xp" ? "notification" : type === "captcha" ? "captcha" : "logs"} is already ${message.guild.channels.cache.get(choice.values[0])} !`), components: [], ephemeral: true })
                    if(!(await message.guild.members.fetchMe()).permissionsIn(choice.values[0]).toArray(false).includes("ViewChannel") || !(await message.guild.members.fetchMe()).permissionsIn(choice.values[0]).toArray(false).includes("SendMessages")) return message.reply(lang.error(req[0].lang === "fr" ? `Le robot ne peut pas envoyer de message dans ${message.guild.channels.cache.get(choice.values[0])} !` : `The robot can't send messages in ${message.guild.channels.cache.get(choice.values[0])} !`))

                    req[0][type === "xp" ? "channelexperience" : type === "captcha" ? "captcha" : "channellogs"] = choice.values[0];
                    await db.update("serveur", type === "xp" ? "channelexperience" : type === "captcha" ? "captcha" : "channellogs", choice.values[0], "guildID", message.guildId)
                    await button.editReply({ content: lang[type](req[0].lang === "fr" ? `Le salon de ${type === "xp" ? "notifications" : type === "captcha" ? "captcha" : "logs"} a été changé en ${message.guild.channels.cache.get(choice.values[0])} avec succès ! ${bot.function.emojis.complete}` : `The channel ${type === "xp" ? "notification" : type === "captcha" ? "captcha" : "logs"} has been changed in ${message.guild.channels.cache.get(choice.values[0])} with success ! ${bot.function.emojis.complete}`), components: [], ephemeral: true })

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                    .setThumbnail(message.guild.iconURL({ dynamic: true }))
                    .addFields([{name: `${bot.function.emojis.prefix} **__${req[0].lang === "fr" ? "Général" : "General"}__**`, value: `> ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk} **${req[0].lang === "fr" ? "Langue" : "Language"}** : ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk}`}, {name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : \`${logs[0].enable === "" ? 0 : logs[0].enable.split(" ").length}\` ${bot.function.emojis.on} \`${logs[0].disable === "" ? 0 : logs[0].disable.split(" ").length}\` ${bot.function.emojis.off}`}, {name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}, {name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    await message.editReply({ embeds: [newEmbed], components: [btn] })

                } catch (err) {

                    return button.editReply({ content: lang.error(req[0].lang === "fr" ? "Vous avez mis trop de temps pour répondre à la question !" : "You took too long to answer the question !"), components: [], ephemeral: true })
                }
            }

            if(button.customId.startsWith("disable_logs") || button.customId.startsWith("disable_channel") || button.customId.startsWith("disable_captcha")) {

                let type = button.customId.includes("logs") ? "logs" : button.customId.includes("captcha") ? "captcha" : "xp";
                if(req[0][type === "xp" ? "channelexperience" : type === "captcha" ? "captcha" : "channellogs"] === "off") return button.reply({ content: lang.error(req[0].lang === "fr" ? `Le salon de ${type === "xp" ? "notifications" : type === "captcha" ? "captcha" : "logs"} est déjà désactivé !` : `The channel ${type === "xp" ? "notification" : type === "captcha" ? "captcha" : "logs"} is already disabled !`), ephemeral: true })
                req[0][type === "xp" ? "channelexperience" : type === "captcha" ? "captcha" : "channellogs"] = "off";
                await db.update("serveur", type === "xp" ? "channelexperience" : type === "captcha" ? "captcha" : "channellogs", "off", "guildID", message.guildId)
                await button.reply({ content: lang[type](req[0].lang === "fr" ? `${message.user} a désactivé ${type === "xp" ? "le salon de notifications" : type === "captcha" ? "le captcha" : "les logs"} avec succès ! ${bot.function.emojis.complete}` : `${message.user} disabled ${type === "xp" ? "the notification channel" : type === "captcha" ? "captcha" : "logs"} with success ! ${bot.function.emojis.complete}`), ephemeral: true })

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.prefix} **__${req[0].lang === "fr" ? "Général" : "General"}__**`, value: `> ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk} **${req[0].lang === "fr" ? "Langue" : "Language"}** : ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk}`}, {name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : \`${logs[0].enable === "" ? 0 : logs[0].enable.split(" ").length}\` ${bot.function.emojis.on} \`${logs[0].disable === "" ? 0 : logs[0].disable.split(" ").length}\` ${bot.function.emojis.off}`}, {name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}, {name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await message.editReply({ embeds: [newEmbed], components: [btn] })
            }

            if(button.customId.startsWith("enable_role_captcha") || button.customId.startsWith("switch_role_captcha")) {

                try {

                    let type = button.customId.includes("captcha") ? "captcha" : "";
                    let filterm = m => m.user.id === message.user.id;
                    let components = [];

                    if(message.guild.roles.cache.filter(r => r.id !== message.guild.roles.everyone.id && !r.managed).size > 25) {

                        let count = Math.floor(message.guild.roles.cache.filter(r => r.id !== message.guild.roles.everyone.id && !r.managed).size / 25) + 1;
                        let number = 0;
                        menu = new Discord.ActionRowBuilder()
                        for(let i = 0; i < count; i++) {
                            let options = [];
                            for(let i2 = number; i2 < ((number + 25) > message.guild.roles.cache.filter(r => r.id !== message.guild.roles.everyone.id && !r.managed).size ? message.guild.roles.cache.filter(r => r.id !== message.guild.roles.everyone.id && !r.managed).size : (number + 25)); i2++) {
                                let role = [...message.guild.roles.cache.filter(r => r.id !== message.guild.roles.everyone.id && !r.managed).values()].sort((a, b) => a.rawPosition - b.rawPosition)[i2];
                                options.push({ value: role.id, label: `${role.name}` })
                            }
                            const menu = new Discord.ActionRowBuilder().addComponents(new Discord.SelectMenuBuilder()
                            .setCustomId("menu" + i + 1)
                            .setPlaceholder(req[0].lang === "fr" ? "Choisissez parmis les choix ci-dessous..." : "Choose from the choices below...")
                            .setMaxValues(1)
                            .setMinValues(1)
                            .addOptions(options))
                            components.push(menu)
                            number += 25;
                        }

                    } else {

                        let options = [];
                        await message.guild.roles.cache.filter(r => r.id !== message.guild.roles.everyone.id && !r.managed).sort((a, b) => a.rawPosition - b.rawPosition).forEach(async role => {
                            options.push({ value: role.id, label: `${role.name}` })
                        })
                        const menu = new Discord.ActionRowBuilder().addComponents(new Discord.SelectMenuBuilder()
                        .setCustomId("menu")
                        .setPlaceholder(req[0].lang === "fr" ? "Choisissez parmis les choix ci-dessous..." : "Choose from the choices below...")
                        .setMaxValues(1)
                        .setMinValues(1)
                        .addOptions(options))
                        components.push(menu)
                    }

                    await button.reply({ content: lang[type]((req[0].lang === "fr" ? `Veuillez choisir un des rôles ci-dessous... ${bot.function.emojis.loading}` : `Please choose one of the roles ​​below... ${bot.function.emojis.loading}`)), components: components, ephemeral: true })
                    let choice = await (await button.fetchReply()).awaitMessageComponent({ filterm, time: 30000, max: 1, errors: [`time`] });
                    if(req[0][type === "captcha" ? "captcharole" : ""] === choice.values[0]) return button.editReply({ content: lang.error(req[0].lang === "fr" ? `Le rôle de ${type === "captcha" ? "captcha" : ""} est déjà ${message.guild.roles.cache.get(choice.values[0])} !` : `The channel ${type === "captcha" ? "captcha" : ""} is already ${message.guild.roles.cache.get(choice.values[0])} !`), components: [], ephemeral: true })

                    req[0][type === "captcha" ? "captcharole" : ""] = choice.values[0];
                    await db.update("serveur", type === "captcha" ? "captcharole" : "", choice.values[0], "guildID", message.guildId)
                    await button.editReply({ content: lang[type](req[0].lang === "fr" ? `Le rôle de ${type === "captcha" ? "captcha" : ""} a été changé en ${message.guild.roles.cache.get(choice.values[0])} avec succès ! ${bot.function.emojis.complete}` : `The role ${"captcha" ? "captcha" : ""} has been changed in ${message.guild.roles.cache.get(choice.values[0])} with success ! ${bot.function.emojis.complete}`), components: [], ephemeral: true })

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                    .setThumbnail(message.guild.iconURL({ dynamic: true }))
                    .addFields([{name: `${bot.function.emojis.prefix} **__${req[0].lang === "fr" ? "Général" : "General"}__**`, value: `> ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk} **${req[0].lang === "fr" ? "Langue" : "Language"}** : ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk}`}, {name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : \`${logs[0].enable === "" ? 0 : logs[0].enable.split(" ").length}\` ${bot.function.emojis.on} \`${logs[0].disable === "" ? 0 : logs[0].disable.split(" ").length}\` ${bot.function.emojis.off}`}, {name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}, {name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    await message.editReply({ embeds: [newEmbed], components: [btn] })

                } catch (err) {

                    return button.editReply({ content: lang.error(req[0].lang === "fr" ? "Vous avez mis trop de temps pour répondre à la question !" : "You took too long to answer the question !"), components: [], ephemeral: true })
                }
            }

            if(button.customId.startsWith("disable_role_captcha")) {

                let type = button.customId.includes("captcha") ? "captcha" : "";
                if(req[0][type === "captcha" ? "captcharole" : ""] === "off") return button.reply({ content: lang.error(req[0].lang === "fr" ? `Le rôle de ${type === "captcha" ? "captcha" : ""} est déjà désactivé !` : `The role ${type === "captcha" ? "captcha" : ""} is already disabled !`), ephemeral: true })
                req[0][type === "captcha" ? "captcharole" : ""] = "off";
                await db.update("serveur", type === "captcha" ? "captcharole" : "", "off", "guildID", message.guildId)
                await button.reply({ content: lang[type](req[0].lang === "fr" ? `${message.user} a désactivé ${type === "captcha" ? "le rôle de captcha" : ""} avec succès ! ${bot.function.emojis.complete}` : `${message.user} disabled ${type === "captcha" ? "the captcha role" : ""} with success ! ${bot.function.emojis.complete}`), ephemeral: true })

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.prefix} **__${req[0].lang === "fr" ? "Général" : "General"}__**`, value: `> ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk} **${req[0].lang === "fr" ? "Langue" : "Language"}** : ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk}`}, {name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : \`${logs[0].enable === "" ? 0 : logs[0].enable.split(" ").length}\` ${bot.function.emojis.on} \`${logs[0].disable === "" ? 0 : logs[0].disable.split(" ").length}\` ${bot.function.emojis.off}`}, {name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}, {name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await message.editReply({ embeds: [newEmbed], components: [btn] })
            }

            if(button.customId.startsWith("enable")) {

                let type = button.customId.split("_")[1];
                if(type === "logs") return;
                if(type === "channel") return;
                if(type === "captcha") return;

                req[0][type] = "on";
                await db.update("serveur", type, "on", "guildID", message.guildId)
                await button.reply({ content: lang[type === "experience" ? "xp" : type](req[0].lang === "fr" ? `${message.user} a activé le module de \`${type === "experience" ? "expérience" : type === "moderation" ? "modération" : type}\` avec succès !` : `${message.user} activated the module \`${type}\` with success !`), ephemeral: true })

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.prefix} **__${req[0].lang === "fr" ? "Général" : "General"}__**`, value: `> ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk} **${req[0].lang === "fr" ? "Langue" : "Language"}** : ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk}`}, {name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : \`${logs[0].enable === "" ? 0 : logs[0].enable.split(" ").length}\` ${bot.function.emojis.on} \`${logs[0].disable === "" ? 0 : logs[0].disable.split(" ").length}\` ${bot.function.emojis.off}`}, {name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}, {name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await message.editReply({ embeds: [newEmbed], components: [btn] })
            }

            if(button.customId.startsWith("disable")) {

                let type = button.customId.split("_")[1];
                if(type === "logs") return;
                if(type === "channel") return;

                req[0][type] = "off";
                await db.update("serveur", type, "off", "guildID", message.guildId)
                await button.reply({ content: lang[type === "experience" ? "xp" : type](req[0].lang === "fr" ? `${message.user} a désactivé le module de \`${type === "experience" ? "expérience" : type === "moderation" ? "modération" : type}\` avec succès !` : `${message.user} disabled the module \`${type}\` with success !`), ephemeral: true })

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.prefix} ${req[0].lang === "fr" ? "Panel de configuration" : "Configuration panel"}`)
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.prefix} **__${req[0].lang === "fr" ? "Général" : "General"}__**`, value: `> ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk} **${req[0].lang === "fr" ? "Langue" : "Language"}** : ${req[0].lang === "fr" ? bot.function.emojis.france : bot.function.emojis.uk}`}, {name: `${bot.function.emojis.moderation} **__${req[0].lang === "fr" ? "Modération" : "Moderation"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].moderation === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.logs} **Logs** : ${req[0].channellogs === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channellogs !== "off" ? ` ${message.guild.channels.cache.get(req[0].channellogs)}` : ""}\n> ${bot.function.emojis.events} **Events** : \`${logs[0].enable === "" ? 0 : logs[0].enable.split(" ").length}\` ${bot.function.emojis.on} \`${logs[0].disable === "" ? 0 : logs[0].disable.split(" ").length}\` ${bot.function.emojis.off}`}, {name: `${bot.function.emojis.captcha} **__Protection__**`, value: `> ${bot.function.emojis.captcha} **Captcha** : ${req[0].captcha === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcha !== "off" ? ` ${message.guild.channels.cache.get(req[0].captcha)}` : ""}\n> ${bot.function.emojis.role} **${req[0].lang === "fr" ? "Rôle du captcha" : "Captcha role"}** : ${req[0].captcharole === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].captcharole !== "off" ? ` ${message.guild.roles.cache.get(req[0].captcharole)}` : ""}`}, {name: `${bot.function.emojis.xp} **__${req[0].lang === "fr" ? "Expérience" : "Experience"}__**`, value: `> ${bot.function.emojis.none} **${req[0].lang === "fr" ? "Etat" : "State"}** : ${req[0].experience === "on" ? bot.function.emojis.on : bot.function.emojis.off}\n> ${bot.function.emojis.channel} **${req[0].lang === "fr" ? "Salon de notifications" : "Notification channel"}** : ${req[0].channelexperience === "off" ? bot.function.emojis.off : bot.function.emojis.on}${req[0].channelexperience !== "off" ? ` ${message.guild.channels.cache.get(req[0].channelexperience)}` : ""}`}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await message.editReply({ embeds: [newEmbed], components: [btn] })
            }

            if(button.customId.startsWith("cancel_")) {
                await button.deferUpdate()
                await collector.stop()
            }
        })

        collector.on("end", async () => {

            let newEmbed = (await message.fetchReply()).embeds[0];
            await message.editReply({ embeds: [newEmbed], components: [] })
        })
    }
})
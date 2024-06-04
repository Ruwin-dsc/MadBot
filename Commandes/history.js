const Discord = require("discord.js")
const { time } = require("@discordjs/builders")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "history",
    description: ["Permet de connaître toutes les infractions d'un utilisateur", "Allow to know all the offenses of a user"],
    utilisation: ["(membre)", "(member)"],
    permission: Discord.PermissionFlagsBits.ManageMessages,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageMessages],
    category: ["Modération", "Moderation"],
    cooldown: 5,
    options: [
        {
            type: "user",
            name: ["membre", "member"],
            description: ["Le membre des infractions", "The member of the offenses"],
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)

        try {

            if(args._hoistedOptions.length > 0) {
                user = await bot.users.fetch(args._hoistedOptions[0].value)
                if(!user) return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvé !" : "No person found !"))
            } else user = message.user;

            let bans = await db.select("bans", "ID", `${message.guildId} ${user.id}`)
            let kicks = await db.select("kicks", "ID", `${message.guildId} ${user.id}`)
            let mutes = await db.select("mutes", "ID", `${message.guildId} ${user.id}`)
            let warns = await db.select("warns", "ID", `${message.guildId} ${user.id}`)

            if(bans.length < 1 && kicks.length < 1 && mutes.length < 1 && warns.length < 1) return message.reply(lang.infractions(req[0].lang === "fr" ? `\`${user.tag}\` n'a aucune infraction sur ce serveur ! ${bot.function.emojis.complete}` : `\`${user.tag}\` has no offense on this server ! ${bot.function.emojis.complete}`))

            await bans.sort((a, b) => parseInt(b.date) - parseInt(a.date))
            await kicks.sort((a, b) => parseInt(b.date) - parseInt(a.date))
            await mutes.sort((a, b) => parseInt(b.date) - parseInt(a.date))
            await warns.sort((a, b) => parseInt(b.date) - parseInt(a.date))

            let number = 0;

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`${bot.function.emojis.infractions} ${req[0].lang === "fr" ? `Infraction(s) de` : `Offense(s) of`} ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(`${lang.ban(req[0].lang === "fr" ? `Cet utilisateur a un total de \`${bans.length}\` bannissement(s) !` : `This user has a total of \`${bans.length}\` ban(s) !`)}\n${lang.kick(req[0].lang === "fr" ? `Cet utilisateur a un total de \`${kicks.length}\` expulsions(s) !` : `This user has a total of \`${kicks.length}\` kick(s) !`)}\n${lang.mute(req[0].lang === "fr" ? `Cet utilisateur a un total de \`${mutes.length}\` muet(s) !` : `This user has a total of \`${mutes.length}\` mute(s) !`)}\n${lang.warn(req[0].lang === "fr" ? `Cet utilisateur a un total de \`${warns.length}\` avertissement(s) !` : `This user has a total of \`${warns.length}\` warn(s) !`)}`)
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Success)
            .setLabel(req[0].lang === "fr" ? "Bannissement" : "Ban")
            .setCustomId(`bans_${user.id}`)
            .setDisabled(bans.length <= 0 ? true : false),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Success)
            .setLabel(req[0].lang === "fr" ? "Expulsion" : "Kick")
            .setCustomId(`kicks_${user.id}`)
            .setDisabled(kicks.length <= 0 ? true : false),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Success)
            .setLabel(req[0].lang === "fr" ? "Muet" : "Mute")
            .setCustomId(`mutes_${user.id}`)
            .setDisabled(mutes.length <= 0 ? true : false),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Success)
            .setLabel(req[0].lang === "fr" ? "Avertissement" : "Warn")
            .setCustomId(`warns_${user.id}`)
            .setDisabled(warns.length <= 0 ? true : false),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Danger)
            .setLabel(req[0].lang === "fr" ? "Annuler" : "Cancel")
            .setCustomId(`cancel_${user.id}`)
            .setLabel('X'))

            await message.reply({ embeds: [Embed], components: [btn] })
            const filter = async () => true;
            const collector = (await message.fetchReply()).createMessageComponentCollector({ filter, time: 120000 })

            collector.on("collect", async button => {

                if(button.user.id !== message.user.id) return button.reply({ content: lang.error(req[0].lang === "fr" ? "Vous n'êtes pas l'auteur du message !" : "You aren't the author of the message !"), ephemeral: true })

                if(button.customId.startsWith("warns_")) {

                    const newbtn = warns.length > 5 ? new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('<--')
                    .setCustomId(`left_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('X')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('-->')
                    .setCustomId(`right_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('Return')
                    .setCustomId(`return_${user.id}`)) : new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('Return')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('X')
                    .setCustomId(`return_${user.id}`))

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(`${bot.function.emojis.warn} ${req[0].lang === "fr" ? `Avertissement(s) de` : `Warn(s) of`} ${user.tag}`)
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    if(warns.length < 1) newEmbed.setDescription(lang.ban(req[0].lang === "fr" ? `Cet utilisateur n'a aucun avertissement !` : `This user has not warn !`))
                    else for (let i = 0; i < (warns.length > 5 ? 5 : warns.length); i++) {

                        newEmbed.addFields([{name: `__**${req[0].lang === "fr" ? "Avertissement" : "Warn"} n°${i + 1}**__`, value: `> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${await bot.users.fetch(warns[i].authorID)}\n> ${bot.function.emojis.id} **${req[0].lang === "fr" ? "Identifiant" : "ID"}** : \`${warns[i].warnID}\`\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${warns[i].reason}\`\n> ${bot.function.emojis.date} **Date** : ${time(Math.floor(parseInt(warns[i].date) / 1000), "F")}`}])
                    }

                    await button.deferUpdate()
                    await message.editReply({ embeds: [newEmbed], components: [newbtn] })
                }

                if(button.customId.startsWith("mutes_")) {

                    const newbtn = mutes.length > 5 ? new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('<--')
                    .setCustomId(`left_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('X')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('-->')
                    .setCustomId(`right_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('Return')
                    .setCustomId(`return_${user.id}`)) : new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('X')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('Return')
                    .setCustomId(`return_${user.id}`))

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(`${bot.function.emojis.timeout} ${req[0].lang === "fr" ? `Muet(s) de` : `Mute(s) of`} ${user.tag}`)
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    if(mutes.length < 1) newEmbed.setDescription(lang.ban(req[0].lang === "fr" ? `Cet utilisateur n'a aucun muet !` : `This user has not mute !`))
                    else for (let i = 0; i < (mutes.length > 5 ? 5 : mutes.length); i++) {

                        newEmbed.addFields([{name: `__**${req[0].lang === "fr" ? "Muet" : "Mute"} n°${i + 1}**__`, value: `> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${await bot.users.fetch(mutes[i].authorID)}\n> ${bot.function.emojis.id} **${req[0].lang === "fr" ? "Identifiant" : "ID"}** : \`${mutes[i].muteID}\`\n> ${bot.function.emojis.time} **${req[0].lang === "fr" ? "Temps" : "Time"}** : \`${mutes[i].time}\`\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${mutes[i].reason}\`\n> ${bot.function.emojis.date} **Date** : ${time(Math.floor(parseInt(mutes[i].date) / 1000), "F")}`}])
                    }

                    await button.deferUpdate()
                    await message.editReply({ embeds: [newEmbed], components: [newbtn] })
                }

                if(button.customId.startsWith("kicks_")) {

                    const newbtn = kicks.length > 5 ? new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('<--')
                    .setCustomId(`left_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('X')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('-->')
                    .setCustomId(`right_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('Return')
                    .setCustomId(`return_${user.id}`)) : new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('X')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('Return')
                    .setCustomId(`return_${user.id}`))

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(`${bot.function.emojis.kick} ${req[0].lang === "fr" ? `Expulsion(s) de` : `Kick(s) of`} ${user.tag}`)
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    if(kicks.length < 1) newEmbed.setDescription(lang.ban(req[0].lang === "fr" ? `Cet utilisateur n'a aucune expulsion !` : `This user has not kick !`))
                    else for (let i = 0; i < (kicks.length > 5 ? 5 : kicks.length); i++) {

                        newEmbed.addFields([{name: `__**${req[0].lang === "fr" ? "Expulsion" : "Kick"} n°${i + 1}**__`, value: `> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${await bot.users.fetch(kicks[i].authorID)}\n> ${bot.function.emojis.id} **${req[0].lang === "fr" ? "Identifiant" : "ID"}** : \`${kicks[i].kickID}\`\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${kicks[i].reason}\`\n> ${bot.function.emojis.date} **Date** : ${time(Math.floor(parseInt(kicks[i].date) / 1000), "F")}`}])
                    }

                    await button.deferUpdate()
                    await message.editReply({ embeds: [newEmbed], components: [newbtn] })
                }

                if(button.customId.startsWith("bans_")) {

                    const newbtn = bans.length > 5 ? new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('<--')
                    .setCustomId(`left_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('X')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('-->')
                    .setCustomId(`right_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('Return')
                    .setCustomId(`return_${user.id}`)) : new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('X')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('Return')
                    .setCustomId(`return_${user.id}`))

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(`${bot.function.emojis.ban} ${req[0].lang === "fr" ? `Bannissement(s) de` : `Ban(s) of`} ${user.tag}`)
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    if(bans.length < 1) newEmbed.setDescription(lang.ban(req[0].lang === "fr" ? `Cet utilisateur n'a aucun bannissement !` : `This user has not ban !`))
                    else for (let i = 0; i < (bans.length > 5 ? 5 : bans.length); i++) {

                        newEmbed.addFields([{name: `__**${req[0].lang === "fr" ? "Bannissement" : "Ban"} n°${i + 1}**__`, value: `> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${await bot.users.fetch(bans[i].authorID)}\n> ${bot.function.emojis.id} **${req[0].lang === "fr" ? "Identifiant" : "ID"}** : \`${bans[i].banID}\`\n> ${bot.function.emojis.time} **${req[0].lang === "fr" ? "Temps" : "Time"}** : \`${bans[i].time}\`\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${bans[i].reason}\`\n> ${bot.function.emojis.date} **Date** : ${time(Math.floor(parseInt(bans[i].date) / 1000), "F")}`}])
                    }

                    await button.deferUpdate()
                    await message.editReply({ embeds: [newEmbed], components: [newbtn] })
                }

                if(button.customId.startsWith("right_")) {

                    number = number + 5;

                    let sanction = (message.user ? (await message.fetchReply()) : msg).embeds[0].title.includes(req[0].lang === "fr" ? "Avertissement" : "Warn") ? warns : (message.user ? (await message.fetchReply()) : msg).embeds[0].title.includes(req[0].lang === "fr" ? "Muet" : "Mute") ? mutes : (message.user ? (await message.fetchReply()) : msg).embeds[0].title.includes(req[0].lang === "fr" ? "Expulsion" : "Kick") ? kicks : (message.user ? (await message.fetchReply()) : msg).embeds[0].title.includes(req[0].lang === "fr" ? "Bannissement" : "Ban") ? bans : ""

                    if(number > sanction.length || number === sanction.length) number = 0;

                    const newbtn = sanction.length > 5 ? new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('<--')
                    .setCustomId(`left_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('X')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('-->')
                    .setCustomId(`right_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('Return')
                    .setCustomId(`return_${user.id}`)) : new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('X')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('Return')
                    .setCustomId(`return_${user.id}`))

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(`${sanction === warns ? bot.function.emojis.warn : sanction === mutes ? bot.function.emojis.timeout : sanction === kicks ? bot.function.emojis.kick : sanction === bans ? bot.function.emojis.ban : ""} ${sanction === warns ? (req[0].lang === "fr" ? "Avertissement(s) de" : "Warn(s) of") : sanction === mutes ? (req[0].lang === "fr" ? "Muet(s) de" : "Mute(s) of") : sanction === kicks ? (req[0].lang === "fr" ? "Expulsion(s) de" : "Kick(s) of") : sanction === bans ? (req[0].lang === "fr" ? "Bannissement(s) de" : "Ban(s) of") : ""} ${user.tag}`)
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    if(sanction.length < 1) newEmbed.setDescription(lang.ban(req[0].lang === "fr" ? `Cet utilisateur n'a aucun avertissement !` : `This user has not warn !`))
                    else for (let i = number; i < (number + 5 > sanction.length ? sanction.length : number + 5); i++) {

                        newEmbed.addFields([{name: `__**${sanction === warns ? (req[0].lang === "fr" ? "Avertissement" : "Warn") : sanction === mutes ? (req[0].lang === "fr" ? "Muet" : "Mute") : sanction === kicks ? (req[0].lang === "fr" ? "Expulsion" : "Kick") : sanction === bans ? (req[0].lang === "fr" ? "Bannissement" : "Ban") : ""} n°${i + 1}**__`, value: `> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${await bot.users.fetch(sanction[i].authorID)}\n> ${bot.function.emojis.id} **${req[0].lang === "fr" ? "Identifiant" : "ID"}** : \`${sanction[i][`${sanction === warns ? "warnID" : sanction === mutes ? "muteID" : sanction === kicks ? "kickID" : sanction === bans ? "banID" : ""}`]}\`${sanction[i].time ? `\n> ${bot.function.emojis.time} **${req[0].lang === "fr" ? "Temps" : "Time"}** : \`${sanction[i].time}\`` : ""}\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${sanction[i].reason}\`\n> ${bot.function.emojis.date} **Date** : ${time(Math.floor(parseInt(sanction[i].date) / 1000), "F")}`}])
                    }

                    await button.deferUpdate()
                    await message.editReply({ embeds: [newEmbed], components: [newbtn] })
                }

                if(button.customId.startsWith("left_")) {

                    number = number - ((`${number}`).endsWith(1) ? 6 : (`${number}`).endsWith(2) ? 7 : (`${number}`).endsWith(3) ? 8 : (`${number}`).endsWith(4) ? 9 : (`${number}`).endsWith(6) ? 6 : (`${number}`).endsWith(7) ? 7 : (`${number}`).endsWith(8) ? 8 : (`${number}`).endsWith(9) ? 9 : 5);

                    let sanction = (message.user ? (await message.fetchReply()) : msg).embeds[0].title.includes(req[0].lang === "fr" ? "Avertissement" : "Warn") ? warns : (message.user ? (await message.fetchReply()) : msg).embeds[0].title.includes(req[0].lang === "fr" ? "Muet" : "Mute") ? mutes : (message.user ? (await message.fetchReply()) : msg).embeds[0].title.includes(req[0].lang === "fr" ? "Expulsion" : "Kick") ? kicks : (message.user ? (await message.fetchReply()) : msg).embeds[0].title.includes(req[0].lang === "fr" ? "Bannissement" : "Ban") ? bans : ""

                    if(number < 0) number = (`${sanction.length}`).endsWith(0) || (`${sanction.length}`).endsWith(5) ? (sanction.length - 5) : sanction.length;

                    const newbtn = sanction.length > 5 ? new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('<--')
                    .setCustomId(`left_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('X')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setLabel('-->')
                    .setCustomId(`right_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('Return')
                    .setCustomId(`return_${user.id}`)) : new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel('X')
                    .setCustomId(`cancel_${user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setLabel('Return')
                    .setCustomId(`return_${user.id}`))

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(`${sanction === warns ? bot.function.emojis.warn : sanction === mutes ? bot.function.emojis.timeout : sanction === kicks ? bot.function.emojis.kick : sanction === bans ? bot.function.emojis.ban : ""} ${sanction === warns ? (req[0].lang === "fr" ? "Avertissement(s) de" : "Warn(s) of") : sanction === mutes ? (req[0].lang === "fr" ? "Muet(s) de" : "Mute(s) of") : sanction === kicks ? (req[0].lang === "fr" ? "Expulsion(s) de" : "Kick(s) of") : sanction === bans ? (req[0].lang === "fr" ? "Bannissement(s) de" : "Ban(s) of") : ""} ${user.tag}`)
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    if(sanction.length < 1) newEmbed.setDescription(lang.ban(req[0].lang === "fr" ? `Cet utilisateur n'a aucun avertissement !` : `This user has not warn !`))
                    else for (let i = (number === sanction.length ? ((`${number}`).endsWith(6) || (`${number}`).endsWith(1) ? (number - 1) : (`${number}`).endsWith(7) || (`${number}`).endsWith(2) ? (number - 2) : (`${number}`).endsWith(8) || (`${number}`).endsWith(3) ? (number - 3) : (`${number}`).endsWith(9) || (`${number}`).endsWith(4) ? (number - 4) : (number - 5)) : number); i < (number === sanction.length ? number : number + 5); i++) {

                        newEmbed.addFields([{name: `__**${sanction === warns ? (req[0].lang === "fr" ? "Avertissement" : "Warn") : sanction === mutes ? (req[0].lang === "fr" ? "Muet" : "Mute") : sanction === kicks ? (req[0].lang === "fr" ? "Expulsion" : "Kick") : sanction === bans ? (req[0].lang === "fr" ? "Bannissement" : "Ban") : ""} n°${i + 1}**__`, value: `> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${await bot.users.fetch(sanction[i].authorID)}\n> ${bot.function.emojis.id} **${req[0].lang === "fr" ? "Identifiant" : "ID"}** : \`${sanction[i][`${sanction === warns ? "warnID" : sanction === mutes ? "muteID" : sanction === kicks ? "kickID" : sanction === bans ? "banID" : ""}`]}\`${sanction[i].time ? `\n> ${bot.function.emojis.time} **${req[0].lang === "fr" ? "Temps" : "Time"}** : \`${sanction[i].time}\`` : ""}\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Reason"}** : \`${sanction[i].reason}\`\n> ${bot.function.emojis.date} **Date** : ${time(Math.floor(parseInt(sanction[i].date) / 1000), "F")}`}])
                    }

                    await button.deferUpdate()
                    await message.editReply({ embeds: [newEmbed], components: [newbtn] })
                }

                if(button.customId.startsWith("return_")) {

                    await button.deferUpdate()
                    await message.editReply({ embeds: [Embed], components: [btn] })
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

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
        }
    }
})
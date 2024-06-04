const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "banlist",
    description: ["Permet d'avoir la liste des utilisateurs bannis", "Allow to get the list of the banned users"],
    utilisation: ["", ""],
    permission: Discord.PermissionFlagsBits.BanMembers,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Modération", "Moderation"],
    cooldown: 5,

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)

        await message.deferReply()

        let bans = await message.guild.bans.fetch()

        if(bans.size === 0) return message.user ? message.followUp(lang.ban(req[0].lang === "fr" ? `Il n'y a aucun bannissement sur ce serveur ! ${bot.function.emojis.complete}` : `There is no ban on the server ! ${bot.function.emojis.complete}`)) : message.reply(lang.ban(req[0].lang === "fr" ? `Il n'y a aucun bannissement sur ce serveur ! ${bot.function.emojis.complete}` : `There is no ban on the server ! ${bot.function.emojis.complete}`))

        if(bans.size <= 5) {

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(req[0].lang === "fr" ? `${bot.function.emojis.ban} Liste des bannissements du serveur` : `${bot.function.emojis.ban} List of the ban of the server`)
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            let i = 0;

            for(const ban of bans) {

                i += 1;

                const fetchGuildAuditLogs = await ban[1].guild.fetchAuditLogs({
                    type: 22
                })

                const BannedMember = fetchGuildAuditLogs.entries;
                let b = BannedMember.find(b => b.reason === ban[1].reason && b.target.id === ban[1].user.id)

                let author = b ? b.executor.id === bot.user.id ? message.guild.members.cache.find(m => m.user.username === b.reason.split(req[0].lang === "fr" ? "(Banni par " : "(Banned by ")[1].replace(")", "").split("#")[0] && m.user.discriminator === b.reason.split(req[0].lang === "fr" ? "(Banni par " : "(Banned by ")[1].replace(")", "").split("#")[1]).user : b.executor : "";

                Embed.addFields([{name: req[0].lang === "fr" ? `**__Bannissement n°${i}__**` : `**__Ban n°${i}__**`, value: `> ${bot.function.emojis.user} **${req[0].lang === "fr" ? "Utilisateur" : "User"}** : \`${ban[1].user.tag}\` ${ban[1].user}\n> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${author ? `${author}` : req[0].lang === "fr" ? "\`Inconnu\`" : "\`Unknow\`"}\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Resaon"}** : \`${ban[1].reason ? ban[1].reason.split(req[0].lang === "fr" ? " (Banni par " : " (Banned by ")[0] : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``}])
            }

            await message.followUp({ embeds: [Embed] })

        } else {

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(req[0].lang === "fr" ? `${bot.function.emojis.ban} Liste des bannissements du serveur` : `${bot.function.emojis.ban} List of the ban of the server`)
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            bans = [...bans.values()]

            for(let i = 0; i < 5; i++) {

                const fetchGuildAuditLogs = await bans[i].guild.fetchAuditLogs({
                    type: 22
                })

                const BannedMember = fetchGuildAuditLogs.entries;
                let b = BannedMember.find(b => b.reason === bans[i].reason && b.target.id === bans[i].user.id)

                let author = b ? b.executor.id === bot.user.id ? message.guild.members.cache.find(m => m.user.username === b.reason.split(req[0].lang === "fr" ? "(Banni par " : "(Banned by ")[1].replace(")", "").split("#")[0] && m.user.discriminator === b.reason.split(req[0].lang === "fr" ? "(Banni par " : "(Banned by ")[1].replace(")", "").split("#")[1]).user : b.executor : "";

                Embed = Embed.addFields([{name: req[0].lang === "fr" ? `**__Bannissement n°${i + 1}__**` : `**__Ban n°${i + 1}__**`, value: `> ${bot.function.emojis.user} **${req[0].lang === "fr" ? "Utilisateur" : "User"}** : \`${bans[i].user.tag}\` ${bans[i].user}\n> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${author ? `${author}` : req[0].lang === "fr" ? "\`Inconnu\`" : "\`Unknow\`"}\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Resaon"}** : \`${bans[i].reason ? bans[i].reason.split(req[0].lang === "fr" ? " (Banni par " : " (Banned by ")[0] : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``}])
            }

            const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Success)
            .setLabel('<--')
            .setCustomId(`left_${message.user.id}`),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Danger)
            .setLabel('X')
            .setCustomId(`cancel_${message.user.id}`),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Success)
            .setLabel('-->')
            .setCustomId(`right_${message.user.id}`))

            await message.followUp({ embeds: [Embed], components: [btn]})

            let number = 0;

            const filter = async () => true;
            const collector = (await message.fetchReply()).createMessageComponentCollector({ filter, time: 120000 })

            collector.on("collect", async button => {

                if(button.user.id !== message.user.id) return message.reply({ content: lang.error(req[0].lang === "fr" ? "Vous n'êtes pas l'auteur du message !" : "You aren't the author of the message !"), ephemeral: true })

                if(button.customId.startsWith("right_")) {

                    number = number + 5;
                    if(number > bans.length || number === bans.length) number = 0;

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(req[0].lang === "fr" ? `${bot.function.emojis.ban} Liste des bannissements du serveur` : `${bot.function.emojis.ban} List of the ban of the server`)
                    .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    for(let i = number; i < (number + 5 > bans.length ? bans.length : number + 5); i++) {

                        const fetchGuildAuditLogs = await bans[i].guild.fetchAuditLogs({
                            type: 22
                        })

                        const BannedMember = fetchGuildAuditLogs.entries;
                        let b = BannedMember.find(b => b.reason === bans[i].reason && b.target.id === bans[i].user.id)

                        let author = b ? b.executor.id === bot.user.id ? message.guild.members.cache.find(m => m.user.username === b.reason.split(req[0].lang === "fr" ? "(Banni par " : "(Banned by ")[1].replace(")", "").split("#")[0] && m.user.discriminator === b.reason.split(req[0].lang === "fr" ? "(Banni par " : "(Banned by ")[1].replace(")", "").split("#")[1]).user : b.executor : "";

                        newEmbed = newEmbed.addFields([{name: req[0].lang === "fr" ? `**__Bannissement n°${i + 1}__**` : `**__Ban n°${i + 1}__**`, value: `> ${bot.function.emojis.user} **${req[0].lang === "fr" ? "Utilisateur" : "User"}** : \`${bans[i].user.tag}\` ${bans[i].user}\n> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${author ? `${author}` : req[0].lang === "fr" ? "\`Inconnu\`" : "\`Unknow\`"}\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Resaon"}** : \`${bans[i].reason ? bans[i].reason.split(req[0].lang === "fr" ? " (Banni par " : " (Banned by ")[0] : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``}])
                    }

                    await button.deferUpdate()
                    await message.editReply({ embeds: [newEmbed] })
                }

                if(button.customId.startsWith("left_")) {

                    number = number - ((`${number}`).endsWith(1) ? 6 : (`${number}`).endsWith(2) ? 7 : (`${number}`).endsWith(3) ? 8 : (`${number}`).endsWith(4) ? 9 : (`${number}`).endsWith(6) ? 6 : (`${number}`).endsWith(7) ? 7 : (`${number}`).endsWith(8) ? 8 : (`${number}`).endsWith(9) ? 9 : 5);
                    if(number < 0) number = (`${bans.length}`).endsWith(0) || (`${bans.length}`).endsWith(5) ? (bans.length - 5) : bans.length;

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(req[0].lang === "fr" ? `${bot.function.emojis.ban} Liste des bannissements du serveur` : `${bot.function.emojis.ban} List of the ban of the server`)
                    .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    for(let i = (number === bans.length ? ((`${number}`).endsWith(6) || (`${number}`).endsWith(1) ? (number - 1) : (`${number}`).endsWith(7) || (`${number}`).endsWith(2) ? (number - 2) : (`${number}`).endsWith(8) || (`${number}`).endsWith(3) ? (number - 3) : (`${number}`).endsWith(9) || (`${number}`).endsWith(4) ? (number - 4) : (number - 5)) : number); i < (number === bans.length ? number : number + 5); i++) {

                        const fetchGuildAuditLogs = await bans[i].guild.fetchAuditLogs({
                            type: 22
                        })

                        const BannedMember = fetchGuildAuditLogs.entries;
                        let b = BannedMember.find(b => b.reason === bans[i].reason && b.target.id === bans[i].user.id)

                        let author = b ? b.executor.id === bot.user.id ? message.guild.members.cache.find(m => m.user.username === b.reason.split(req[0].lang === "fr" ? "(Banni par " : "(Banned by ")[1].replace(")", "").split("#")[0] && m.user.discriminator === b.reason.split(req[0].lang === "fr" ? "(Banni par " : "(Banned by ")[1].replace(")", "").split("#")[1]).user : b.executor : "";

                        newEmbed = newEmbed.addFields([{name: req[0].lang === "fr" ? `**__Bannissement n°${i + 1}__**` : `**__Ban n°${i + 1}__**`, value: `> ${bot.function.emojis.user} **${req[0].lang === "fr" ? "Utilisateur" : "User"}** : \`${bans[i].user.tag}\` ${bans[i].user}\n> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${author ? `${author}` : req[0].lang === "fr" ? "\`Inconnu\`" : "\`Unknow\`"}\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Resaon"}** : \`${bans[i].reason ? bans[i].reason.split(req[0].lang === "fr" ? " (Banni par " : " (Banned by ")[0] : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``}])
                    }

                    await button.deferUpdate()
                    await message.editReply({ embeds: [newEmbed] })
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
    }
})
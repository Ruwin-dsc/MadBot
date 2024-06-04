const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "mutelist",
    description: ["Permet d'avoir la liste des utilisateurs muets", "Allow to get the list of the muted users"],
    utilisation: ["", ""],
    permission: Discord.PermissionFlagsBits.ModerateMembers,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Modération", "Moderation"],
    cooldown: 5,

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)

        await message.deferReply()

        let mutes = (await message.guild.members.fetch()).filter(m => m.isCommunicationDisabled())

        if(mutes.size === 0) return message.followUp(lang.mute(req[0].lang === "fr" ? `Il n'y a actuellement aucun membre muet sur ce serveur ! ${bot.function.emojis.complete}` : `There are currently no mute members on this server ! ${bot.function.emojis.complete}`))

        if(mutes.size <= 5) {

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(req[0].lang === "fr" ? `${bot.function.emojis.timeout} Liste des membres muet du serveur` : `${bot.function.emojis.timeout} List of the muted members of the server`)
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            let i = 0;

            for(const mute of mutes) {

                i += 1;

                const fetchGuildAuditLogs = await mute[1].guild.fetchAuditLogs({
                    type: 24
                })

                const MutedMember = fetchGuildAuditLogs.entries;
                let mu = MutedMember.find(m => m.target.id === mute[1].user.id)
                let author = mu ? mu.executor.id === bot.user.id ? message.guild.members.cache.find(m => m.user.username === mu.reason.split(req[0].lang === "fr" ? "(Rendu muet par " : "(Muted by ")[1].replace(")", "").split("#")[0] && m.user.discriminator === mu.reason.split(req[0].lang === "fr" ? "(Rendu muet par " : "(Muted by ")[1].replace(")", "").split("#")[1]).user : mu.executor : "";

                Embed.addFields([{name: req[0].lang === "fr" ? `**__Muet n°${i}__**` : `**__Mute n°${i}__**`, value: `> ${bot.function.emojis.user} **${req[0].lang === "fr" ? "Utilisateur" : "User"}** : ${mute[1].user}\n> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${author ? `${author}` : req[0].lang === "fr" ? "\`Inconnu\`" : "\`Unknow\`"}\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Resaon"}** : \`${mu.reason ? mu.reason.split(req[0].lang === "fr" ? " (Rendu muet par " : " (Muted by ")[0] : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``}])
            }

            await message.followUp({ embeds: [Embed] })

        } else {

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(req[0].lang === "fr" ? `${bot.function.emojis.timeout} Liste des membres muet du serveur` : `${bot.function.emojis.timeout} List of the muted members of the server`)
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            mutes = [...mutes.values()]

            for(let i = 0; i < 5; i++) {

                const fetchGuildAuditLogs = await mutes[i].guild.fetchAuditLogs({
                    type: 24
                })

                const MutedMember = fetchGuildAuditLogs.entries;
                let mu = MutedMember.find(m => m.target.id === mutes[i].user.id)

                let author = mu ? mu.executor.id === bot.user.id ? message.guild.members.cache.find(m => m.user.username === mu.reason.split(req[0].lang === "fr" ? "(Rendu muet par " : "(Muted by ")[1].replace(")", "").split("#")[0] && m.user.discriminator === mu.reason.split(req[0].lang === "fr" ? "(Rendu muet par " : "(Muted by ")[1].replace(")", "").split("#")[1]).user : mu.executor : "";

                Embed.addFields([{name: req[0].lang === "fr" ? `**__Muet n°${i + 1}__**` : `**__Mute n°${i + 1}__**`, value: `> ${bot.function.emojis.user} **${req[0].lang === "fr" ? "Utilisateur" : "User"}** : ${mutes[i].user}\n> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${author ? `${author}` : req[0].lang === "fr" ? "\`Inconnu\`" : "\`Unknow\`"}\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Resaon"}** : \`${mu.reason ? mu.reason.split(req[0].lang === "fr" ? " (Rendu muet par " : " (Muted by ")[0] : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``}])
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

            await message.followUp({ embeds: [Embed], components: [btn] })

            let number = 0;

            const filter = async () => true;
            const collector = (await message.fetchReply()).createMessageComponentCollector({ filter, time: 120000 })

            collector.on("collect", async button => {

                if(button.user.id !== message.user.id) return message.reply({ content: lang.error(req[0].lang === "fr" ? "Vous n'êtes pas l'auteur du message !" : "You aren't the author of the message !"), ephemeral: true })

                if(button.customId.startsWith("right_")) {

                    number = number + 5;
                    if(number > mutes.length || number === mutes.length) number = 0;

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(req[0].lang === "fr" ? `${bot.function.emojis.timeout} Liste des membres muet du serveur` : `${bot.function.emojis.timeout} List of the muted members of the server`)
                    .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    for(let i = number; i < (number + 5 > mutes.length ? mutes.length : number + 5); i++) {

                        const fetchGuildAuditLogs = await mutes[i].guild.fetchAuditLogs({
                            type: 24
                        })

                        const MutedMember = fetchGuildAuditLogs.entries;
                        let mu = MutedMember.find(m => m.target.id === mutes[i].user.id)

                        let author = mu ? mu.executor.id === bot.user.id ? message.guild.members.cache.find(m => m.user.username === mu.reason.split(req[0].lang === "fr" ? "(Rendu muet par " : "(Muted by ")[1].replace(")", "").split("#")[0] && m.user.discriminator === mu.reason.split(req[0].lang === "fr" ? "(Rendu muet par " : "(Muted by ")[1].replace(")", "").split("#")[1]).user : mu.executor : "";

                        newEmbed = newEmbed.addFields([{name: req[0].lang === "fr" ? `**__Muet n°${i + 1}__**` : `**__Mute n°${i + 1}__**`, value: `> ${bot.function.emojis.user} **${req[0].lang === "fr" ? "Utilisateur" : "User"}** : ${mutes[i].user}\n> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${author ? `${author}` : req[0].lang === "fr" ? "\`Inconnu\`" : "\`Unknow\`"}\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Resaon"}** : \`${mu.reason ? mu.reason.split(req[0].lang === "fr" ? " (Rendu muet par " : " (Muted by ")[0] : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``}])
                    }

                    await button.deferUpdate()
                    await message.editReply({ embeds: [newEmbed] })
                }

                if(button.customId.startsWith("left_")) {

                    number = number - ((`${number}`).endsWith(1) ? 6 : (`${number}`).endsWith(2) ? 7 : (`${number}`).endsWith(3) ? 8 : (`${number}`).endsWith(4) ? 9 : (`${number}`).endsWith(6) ? 6 : (`${number}`).endsWith(7) ? 7 : (`${number}`).endsWith(8) ? 8 : (`${number}`).endsWith(9) ? 9 : 5);
                    if(number < 0) number = (`${mutes.length}`).endsWith(0) || (`${mutes.length}`).endsWith(5) ? (mutes.length - 5) : mutes.length;

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setTitle(req[0].lang === "fr" ? `${bot.function.emojis.timeout} Liste des membres muet du serveur` : `${bot.function.emojis.timeout} List of the muted members of the server`)
                    .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    for(let i = (number === mutes.length ? ((`${number}`).endsWith(6) || (`${number}`).endsWith(1) ? (number - 1) : (`${number}`).endsWith(7) || (`${number}`).endsWith(2) ? (number - 2) : (`${number}`).endsWith(8) || (`${number}`).endsWith(3) ? (number - 3) : (`${number}`).endsWith(9) || (`${number}`).endsWith(4) ? (number - 4) : (number - 5)) : number); i < (number === mutes.length ? number : number + 5); i++) {

                        const fetchGuildAuditLogs = await mutes[i].guild.fetchAuditLogs({
                            type: 24
                        })

                        const MutedMember = fetchGuildAuditLogs.entries;
                        let mu = MutedMember.find(m => m.target.id === mutes[i].user.id)

                        let author = mu ? mu.executor.id === bot.user.id ? message.guild.members.cache.find(m => m.user.username === mu.reason.split(req[0].lang === "fr" ? "(Rendu muet par " : "(Muted by ")[1].replace(")", "").split("#")[0] && m.user.discriminator === mu.reason.split(req[0].lang === "fr" ? "(Rendu muet par " : "(Muted by ")[1].replace(")", "").split("#")[1]).user : mu.executor : "";

                        newEmbed = newEmbed.addFields([{name: req[0].lang === "fr" ? `**__Muet n°${i + 1}__**` : `**__Mute n°${i + 1}__**`, value: `> ${bot.function.emojis.user} **${req[0].lang === "fr" ? "Utilisateur" : "User"}** : ${mutes[i].user}\n> ${bot.function.emojis.owner} **${req[0].lang === "fr" ? "Auteur" : "Author"}** : ${author ? `${author}` : req[0].lang === "fr" ? "\`Inconnu\`" : "\`Unknow\`"}\n> ${bot.function.emojis.reason} **${req[0].lang === "fr" ? "Raison" : "Resaon"}** : \`${mu.reason ? mu.reason.split(req[0].lang === "fr" ? " (Rendu muet par " : " (Muted by ")[0] : req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified"}\``}])
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
const Discord = require("discord.js")
const moment = require("moment")
const setup = require("moment-duration-format")
const Event = require("../../Structure/Event")
setup(moment)

module.exports = new Event("interactionCreate", async (bot, interaction) => {
    let req = await bot.db.selectGuild(interaction.guildId)
    if(req.length < 1) {
        await db.insert("serveur", ["guildID", "lang", "experience", "channelexperience", "moderation", "channellogs", "captcha", "captcharole"], [`${interaction.guildId}`, "en", "off", "off", "on", "off", "off", "off"])
        req = await bot.db.selectGuild(interaction.guildId)
    }
    let logs = await bot.db.selectLogs(interaction.guildId)
    if(logs.length < 1) bot.db.insert("logs", ["guildID", "enable", "disable"], [`${interaction.guildId}`, "", "channelLock channelUnlock channelSlowmode guildMemberBan guildMemberMessagesClear guildMemberUnban guildMemberKick guildMemberMute guildMemberUnmute guildMemberWarn guildMemberOffenseDelete messageClear"])
    const lang = bot.function[req[0].lang];

    if(interaction.type === Discord.InteractionType.ApplicationCommand) {

        const command = bot.commands.get(interaction.commandName)

        if(req[0][command.category[1].toLowerCase()] === "off") try {
            return interaction.reply({content: lang.error(req[0].lang === "fr" ? `Le module \`${command.category[0].slice(0, 1).toLowerCase() + command.category[0].slice(1, command.category[0].length)}\` est désactivé sur ce serveur !` : `The module \`${command.category[1].slice(0, 1).toLowerCase() + command.category[1].slice(1, command.category[1].length)}\` is disabled on this server !`), ephemeral: true})
        } catch (err) { return }

        let permbot = [];
        for (let i = 0; i < command.botpermission; i++) permbot.push(new Discord.PermissionsBitField(command.botpermission[i]))

        if(!(await interaction.guild.members.fetchMe()).permissions.has(permbot)) {
            try {
                return interaction.reply({content: lang.error(req[0].lang === "fr" ? "Le bot n'a pas les permissions requise pour exécuter cette commande !" : "The bot doesn't have the required permissions to execute this command !"), ephemeral: true})
            } catch (err) { return; }
        }
        if(command.permission === "Développeur" && interaction.user.id !== "499974131572539392") {
            try {
                return interaction.reply({content: lang.error(req[0].lang === "fr" ? "Vous n'avez pas la permission requise pour exécuter cette commande !" : "You don't have the required permission to execute this command !"), ephemeral: true})
            } catch (err) { return; }
        }
        if(command.permission !== "Aucune" && command.permission !== "Développeur" && !interaction.member.permissions.has(new Discord.PermissionsBitField(command.permission))) try {
            return interaction.reply({content: lang.error(req[0].lang === "fr" ? "Vous n'avez pas la permission requise pour exécuter cette commande !" : "You don't have the required permission to execute this command !"), ephemeral: true})
        } catch (err) { return }

        if(!bot.cooldown.has(command.name) && interaction.user.id !== "499974131572539392") {
            bot.cooldown.set(command.name, new Discord.Collection())
        }

        const time = Date.now();
        const cooldown = bot.cooldown.get(command.name);
        const timeCooldown = (command.cooldown || 5) * 1000;

        if(cooldown?.has(interaction.user.id)) {

            const timeRestant = cooldown.get(interaction.user.id) + timeCooldown;

            if(time < timeRestant) {

                const timeLeft = (timeRestant - time);

                let duration = moment.duration(timeLeft).format(" \`d\` [day] \`h\` [hour] \`m\` [minute] et \`s\` [second] ");
                if(duration.includes("second") && req[0].lang === "fr") duration = duration.replace(/second/g, "seconde")
                if(duration.includes("seconds") && req[0].lang === "fr") duration = duration.replace(/seconds/g, "secondes")
                if(duration.includes("hour") && req[0].lang === "fr") duration = duration.replace(/hour/g, "heure")
                if(duration.includes("hours") && req[0].lang === "fr") duration = duration.replace(/hours/g, "heures")
                if(duration.includes("day") && req[0].lang === "fr") duration = duration.replace(/day/g, "jour")
                if(duration.includes("days") && req[0].lang === "fr") duration = duration.replace(/days/g, "jours")

                try {
                    return interaction.reply({content: lang.error(req[0].lang === "fr" ? `Vous devez attendre ${duration} pour exécuter cette commande !` : `You must wait ${duration} to execute this command !`), ephemeral: true})
                } catch (err) { return }
            }
        }

        cooldown?.set(interaction.user.id, time);
        setTimeout(() => cooldown?.delete(interaction.user.id), timeCooldown);

        command.run(bot, interaction, interaction.options, bot.db)
    } else if(interaction.type === Discord.InteractionType.ApplicationCommandAutocomplete) {

        if(interaction.commandName === "help" || interaction.commandName === "report") {

            let focus = interaction.options.getFocused()
            let commands = [];
            await bot.commands.forEach(async cmd => await commands.push(cmd.name))
            let choices = commands.filter(choice => choice.includes(focus))
            
            if(choices.length > 25) await interaction.respond(choices.slice(0, 25).map(choice => ({name: choice, value: choice})))
            else await interaction.respond(choices.map(choice => ({name: choice, value: choice})))
        }
    } else if(interaction.isButton()) {
        if(interaction.customId === "accept_bug") {

            await interaction.message.edit({embdes: [interaction.message.embeds[0]], components: []})
        }

        if(interaction.customId === "refuse_bug") {

            await interaction.message.delete()
        }

        if(interaction.customId.startsWith("unban")) {

            if(!interaction.member.permissions.has(Discord.PermissionFlagsBits.BanMembers)) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Vous n'avez pas la permission requise pour exécuter cette action !" : "You don't have the required permission to execute this action !"), ephemeral: true })
            if(!(await interaction.guild.members.fetchMe()).permissions.has(Discord.PermissionFlagsBits.BanMembers)) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Le bot n'a pas les permissions requise pour exécuter cette action !" : "The bot doesn't have the required permissions to execute this action !"), ephemeral: true })

            if(!(await interaction.guild.bans.fetch()).get(interaction.customId.split("_")[1])) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Cette personne n'est pas bannie !" : "This person is not banned !"), ephemeral: true })

            await interaction.reply({ content: lang.unban(req[0].lang === "fr" ? `Quelle est la raison du débannissement ? Si vous ne voulez pas spécifier la raison, envoyez \`Aucune\` ! ${bot.function.emojis.loading}` : `What is the reason for the unban ? Ifyou don't want to specify the reason, send \`None\` ! ${bot.function.emojis.loading}`), ephemeral: true })

            try {

                let filter = m => m.author.id === interaction.user.id;
                let reponse = (await interaction.channel.awaitMessages({ filter, max: 1, time: 120000, errors: [`time`] })).first()
                let reason;
                if(reponse.content.toLowerCase() === "aucune" || reponse.content.toLowerCase() === "none") reason = req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified";
                else reason = reponse.content;
                await reponse.delete()

                await interaction.guild.members.unban(interaction.customId.split("_")[1], `${reason} (${req[0].lang === "fr" ? "Débanni par" : "Unbanned by"} ${interaction.user.tag})`)

                try {
                    await (await bot.users.fetch(interaction.customId.split("_")[1])).send(lang.unban(req[0].lang === "fr" ? `Vous avez été débanni du serveur \`${interaction.guild.name}\` par \`${interaction.user.tag}\` ! ${bot.function.emojis.complete}` : `You have been unbanned of the server \`${interaction.guild.name}\` by \`${interaction.user.tag}\` ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason))
                } catch (err) { }
                await interaction.editReply({ content: lang.unban(req[0].lang === "fr" ? `${interaction.user} a débanni \`${(await bot.users.fetch(interaction.customId.split("_")[1])).tag}\` avec succès ! ${bot.function.emojis.complete}` : `${interaction.user} unbanned \`${(await bot.users.fetch(interaction.customId.split("_")[1])).tag}\` with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason) })

            } catch (err) {

                return interaction.editReply({ content: lang.error(req[0].lang === "fr" ? "Vous avez mis trop de temps pour répondre à la question !" : "You took too long to answer the question !"), epehemeral: true })
            }
        }

        if(interaction.customId.startsWith("unmute")) {

            if(!interaction.member.permissions.has(Discord.PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Vous n'avez pas la permission requise pour exécuter cette action !" : "You don't have the required permission to execute this action !"), ephemeral: true })
            if(!(await interaction.guild.members.fetchMe()).permissions.has(Discord.PermissionFlagsBits.ModerateMembers)) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Le bot n'a pas les permissions requise pour exécuter cette action !" : "The bot doesn't have the required permissions to execute this action !"), ephemeral: true })

            let member = interaction.guild.members.cache.get(interaction.customId.split("_")[1])
            if(!member) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Cette personne n'est pas sur le serveur !" : "This person is not on the server !"), ephemeral: true })
            if(!member.isCommunicationDisabled()) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Cette personne n'est pas muette !" : "This person is not mute !"), ephemeral: true })

            await interaction.reply({ content: lang.unmute(req[0].lang === "fr" ? `Quelle est la raison du rendement de parole ? Si vous ne voulez pas spécifier la raison, envoyez \`Aucune\` ! ${bot.function.emojis.loading}` : `What is the reason for the unmute ? Ifyou don't want to specify the reason, send \`None\` ! ${bot.function.emojis.loading}`), ephemeral: true })

            try {

                let filter = m => m.author.id === interaction.user.id;
                let reponse = (await interaction.channel.awaitMessages({ filter, max: 1, time: 120000, errors: [`time`] })).first()
                let reason;
                if(reponse.content.toLowerCase() === "aucune" || reponse.content.toLowerCase() === "none") reason = req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified";
                else reason = reponse.content;
                await reponse.delete()

                await member.timeout(null, `${reason} (${req[0].lang === "fr" ? "Parole rendu par" : "Unmuted by"} ${interaction.user.tag})`)

                try {
                    await member.user.send(lang.unmute(req[0].lang === "fr" ? `Votre parole vous a été rendu sur le serveur \`${interaction.guild.name}\` par \`${interaction.user.tag}\` ! ${bot.function.emojis.complete}` : `You have been unmuted on the server \`${interaction.guild.name}\` by \`${interaction.user.tag}\` ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason))
                } catch (err) { }
                await interaction.editReply({ content: lang.unmute(req[0].lang === "fr" ? `${interaction.user} a rendu la parole de \`${(await bot.users.fetch(interaction.customId.split("_")[1])).tag}\` avec succès ! ${bot.function.emojis.complete}` : `${interaction.user} unmuted \`${(await bot.users.fetch(interaction.customId.split("_")[1])).tag}\` with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason) })

            } catch (err) {

                return interaction.editReply({ content: lang.error(req[0].lang === "fr" ? "Vous avez mis trop de temps pour répondre à la question !" : "You took too long to answer the question !"), epehemeral: true })
            }
        }

        if(interaction.customId.includes("unslowmode")) {

            if(!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageChannels)) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Vous n'avez pas la permission requise pour exécuter cette action !" : "You don't have the required permission to execute this action !"), ephemeral: true })
            if(!(await interaction.guild.members.fetchMe()).permissions.has(Discord.PermissionFlagsBits.ManageChannels)) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Le bot n'a pas les permissions requise pour exécuter cette action !" : "The bot doesn't have the required permissions to execute this action !"), ephemeral: true })

            let channel = interaction.guild.channels.cache.get(interaction.customId.split("_")[1])
            if(!channel) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Aucun salon trouvé !" : "No channel found !"), ephemeral: true })
            if(channel.rateLimitPerUser === 0) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Ce salon n'est pas ralenti !" : "This channel is not in the slowmode !"), ephemeral: true })

            await (await bot.channels.fetch(interaction.customId.split("_")[1])).setRateLimitPerUser(0)
            await interaction.reply({ content: lang.unslowmode(req[0].lang === "fr" ? `${interaction.user} a annulé le ralentissement du salon ${await bot.channels.fetch(interaction.customId.split("_")[1])} avec succès !` : `${interaction.user} canceled the slowmode of the channel ${await bot.channels.fetch(interaction.customId.split("_")[1])} with success !`), ephemeral: true })
            await bot.emit("channelSlowmode", channel, interaction.user, "0s")
        }

        if(interaction.customId.includes("unlock")) {

            if(!interaction.member.permissions.has(Discord.PermissionFlagsBits.ManageChannels)) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Vous n'avez pas la permission requise pour exécuter cette action !" : "You don't have the required permission to execute this action !"), ephemeral: true })
            if(!(await interaction.guild.members.fetchMe()).permissions.has(Discord.PermissionFlagsBits.ManageChannels)) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Le bot n'a pas les permissions requise pour exécuter cette action !" : "The bot doesn't have the required permissions to execute this action !"), ephemeral: true })

            let channel = interaction.guild.channels.cache.get(interaction.customId.split("_")[1])
            if(!channel) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Aucun salon trouvé !" : "No channel found !"), ephemeral: true })
            if(!channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id).deny.toArray(false).includes("SendMessages")) return interaction.reply({ content: lang.error(req[0].lang === "fr" ? "Ce salon n'est pas verouillé !" : "This channel is not locked !"), ephemeral: true })

            await interaction.reply({ content: lang.unlock(req[0].lang === "fr" ? `Quelle est la raison du déverrouillage ? Si vous ne voulez pas spécifier la raison, envoyez \`Aucune\` ! ${bot.function.emojis.loading}` : `What is the reason for the unlock ? Ifyou don't want to specify the reason, send \`None\` ! ${bot.function.emojis.loading}`), ephemeral: true })

            try {

                let filter = m => m.author.id === interaction.user.id;
                let reponse = (await interaction.channel.awaitMessages({ filter, max: 1, time: 120000, errors: [`time`] })).first()
                let reason;
                if(reponse.content.toLowerCase() === "aucune" || reponse.content.toLowerCase() === "none") reason = req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified";
                else reason = reponse.content;
                await reponse.delete()

                await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    SendMessages: true
                })

                await interaction.editReply({ content: lang.unlock(req[0].lang === "fr" ? `${interaction.user} a déverrouillé le salon ${await bot.channels.fetch(interaction.customId.split("_")[1])} avec succès ! ${bot.function.emojis.complete}` : `${interaction.user} unlocked of the channel ${await bot.channels.fetch(interaction.customId.split("_")[1])} with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason), ephemeral: true })
                await bot.emit("channelUnlock", channel, interaction.user, reason)

            } catch (err) {

                return interaction.editReply({ content: lang.error(req[0].lang === "fr" ? "Vous avez mis trop de temps pour répondre à la question !" : "You took too long to answer the question !"), epehemeral: true })
            }
        }
    } else return
})
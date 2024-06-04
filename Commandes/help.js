const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "help",
    description: ["Permet de connaître toutes les commandes du robot", "Allow to get all bot's commands"],
    utilisation: ["", ""],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageMessages],
    category: ["Informations", "Informations"],
    cooldown: 2,
    options: [
        {
            type: "string",
            name: ["commande", "command"],
            description: ["La commande à afficher", "The command to display"],
            required: false,
            autocomplete: true
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)
        let command;

        if(args._hoistedOptions.length > 0) {
            command = bot.commands.get(args.getString("command"))
            if(!command) return message.reply(lang.error(req[0].lang === "fr" ? "Aucune commande trouvée !" : "No command found !"))
        }

        if(!command) {

            const menu = new Discord.ActionRowBuilder().addComponents(new Discord.SelectMenuBuilder()
            .setMaxValues(1)
            .setMinValues(1)
            .setPlaceholder(req[0].lang === "fr" ? "Choisissez parmis les choix ci-dessous..." : "Choose from the choices below...")
            .setCustomId(`help_${message.user.id}`)
            .addOptions([{ label: "Configuration", emoji: "926867863329980477", value: "configuration" }, { label: req[0].lang === "fr" ? "Expérience" : "Experience", emoji: "895961667853254696", value: "experience" }, { label: "Informations", emoji: "914153641319993364", value: "informations" }, { label: req[0].lang === "fr" ? "Modération" : "Moderation", emoji: "901527981086867526", value: "moderation" }, {label: req[0].lang === "fr" ? "Système" : "System", emoji: "1011669847974879272", value: "system"}]))

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
            .setTitle(`${bot.function.emojis.info} ${req[0].lang === "fr" ? "Informations sur les commandes du robot" : "Informations about the bot's commands"}`)
            .setDescription(req[0].lang === "fr" ? `● **Pour plus d'informations sur une commande** : \`/help [commande]\`\n● **Commandes disponibles** : \`${bot.commands.size}\`\n\n${bot.function.emojis.prefix} : Permet de connaître les commandes de \`configuration\`\n${bot.function.emojis.xp} : Permet de connaître les commandes d'\`expérience\`\n${bot.function.emojis.info} : Permet de connaître les commandes d'\`informations\`\n${bot.function.emojis.moderation} : Permet de connaître les commandes de \`modération\`\n${bot.function.emojis.system} : Permet de connaître les commandes du \`système\`` : `● **For more informations about a command** : \`/help [command]\`\n● **Avaible commands** : \`${bot.commands.size}\`\n\n${bot.function.emojis.prefix} : Allow to get the commands of \`configuration\`\n${bot.function.emojis.xp} : Allow to get the commands of \`experience\`\n${bot.function.emojis.info} : Allow to get the commands of \`informations\`\n${bot.function.emojis.moderation} : Allow to get the commands of \`moderation\`\n${bot.function.emojis.system} : Allow to get the commands of \`system\``)
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            const msg = await message.reply({ embeds: [Embed], components: [menu] })

            const filter = async () => true;
            const collector = msg.createMessageComponentCollector({ filter, time: 120000 })

            collector.on("collect", async menu => {

                if(menu.user.id !== message.user.id) return menu.reply({ content: lang.error(req[0].lang === "fr" ? "Vous n'êtes pas l'auteur du message !" : "You aren't the author of the message !"), ephemeral: true })

                let commands = bot.commands.filter(c => c.category[1].toLowerCase() === menu.values[0])

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.info} ${req[0].lang === "fr" ? "Informations sur les commandes du robot" : "Informations about the bot's commands"}`)
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .setDescription(req[0].lang === "fr" ? `● **Pour plus d'informations sur une commande** : \`/help [commande]\`\n● **Commandes disponibles** : \`${bot.commands.size}\`` : `● **For more informations about a command** : \`/help [command]\`\n● **Avaible commands** : \`${bot.commands.size}\``)
                .addFields([{name: menu.values[0] === "informations" ? `${bot.function.emojis.info} Informations` : menu.values[0] === "experience" ? `${bot.function.emojis.xp} ${req[0].lang === "fr" ? "Expérience" : "Experience"}` : menu.values[0] === "moderation" ? `${bot.function.emojis.moderation} ${req[0].lang === "fr" ? "Modération" : "Moderation"}` : menu.values[0] === "configuration" ? `${bot.function.emojis.prefix} Configuration` : menu.values[0] === "system" ? `${bot.function.emojis.system} ${req[0].lang === "fr" ? "Système" : "System"}` : menu.values[0], value: commands.map(cmd => `\`${cmd.name}\` ➔ ${cmd.description[req[0].lang === "fr" ? 0 : 1]}`).join("\n")}])
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await menu.deferUpdate()
                await message.editReply({ embeds: [newEmbed] })
            })

            collector.on("end", async () => {

                await message.editReply({ embeds: [(await message.fetchReply()).embeds[0]], components: [] })
            })

        } else {

            if(req[0].lang === "fr") {

                let Embed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.info} Informations sur la commande ${command.name}`)
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`${bot.function.emojis.command} **Nom** : \`${args.getString("command")}\`\n${bot.function.emojis.nickname} **Description** : \`${command.description[0]}\`\n${bot.function.emojis.use} **Utilisation** : \`/${args.getString("command")}${command.utilisation[0] !== "" ? ` ${command.utilisation[0]}` : ""}\`\n${bot.function.emojis.permission} **Permission requise** : \`${command.permission === "Aucune" ? "Aucune" : command.permission === "Développeur" ? "Développeur" : new Discord.PermissionsBitField(command.permission).toArray(false)}\`\n${bot.function.emojis.robot} **Permissions requise du robot** : ${command.botpermission.map(p => `\`${new Discord.PermissionsBitField(p).toArray(false)}\``).join(" ")}\n${bot.function.emojis.category} **Catégorie** : \`${command.category[0]}\`\n${bot.function.emojis.time} **Cooldown** : \`${command.cooldown} ${command.cooldown <= 1 ? "seconde" : "secondes"}\``)
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                message.reply({ embeds: [Embed] })
            }

            if(req[0].lang === "en") {

                let Embed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.info} Informations about the command ${command.name}`)
                .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
                .setDescription(`${bot.function.emojis.command} **Name** : \`${args.getString("command")}\`\n${bot.function.emojis.nickname} **Description** : \`${command.description[1]}\`\n${bot.function.emojis.use} **Use** : \`/${args.getString("command")} ${command.utilisation[1] !== "" ? ` ${command.utilisation[1]}` : ""}\`\n${bot.function.emojis.permission} **Required permission** : \`${command.permission === "Aucune" ? "No" : command.permission === "Développeur" ? "Developer" : new Discord.PermissionsBitField(command.permission).toArray(false)}\`\n${bot.function.emojis.robot} **Required permissions for the bot** : ${command.botpermission.map(p => `\`${new Discord.PermissionsBitField(p).toArray(false)}\``).join(" ")}\n${bot.function.emojis.category} **Category** : \`${command.category[1]}\`\n${bot.function.emojis.time} **Cooldown** : \`${command.cooldown} ${command.cooldown <= 1 ? "second" : "seconds"}\``)
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                message.reply({ embeds: [Embed] })
            }
        }
    }
})
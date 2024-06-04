const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "report",
    description: ["Permet de signaler un bug", "Allow to report a bug"],
    utilisation: ["[commande] [bug]", "[command] [bug]"],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Système", "System"],
    cooldown: 120,
    options: [
        {
            type: "string",
            name: ["commande", "command"],
            description: ["La commande ayant le bug", "The command who has the bug"],
            required: true,
            autocomplete: true
        }, {
            type: "string",
            name: ["bug", "bug"],
            description: ["Le bug à signaler", "The bug to report"],
            required: true,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = bot.function[req[0].lang]

        let command = bot.commands.get(args.getString("command"))
        if(!command) return message.reply(lang.error(req[0].lang === "fr" ? "Aucune commande trouvée !" : "No command found !"))

        let bug = args.getString("bug")

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setTitle(`${bot.function.emojis.bug_hunter2} Nouveau rapport de bug`)
        .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`${bot.function.emojis.owner} **Auteur** : \`${message.user.tag}\`\n${bot.function.emojis.command} **Commande** : \`${command.name}\`\n${bot.function.emojis.bug_hunter2} **Bug** : \`\`\`\n${bug}\`\`\``)
        .setTimestamp()
        .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

        const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Success)
        .setCustomId("accept_bug")
        .setLabel("Valider le bug"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Danger)
        .setCustomId("refuse_bug")
        .setLabel("Refuser le bug"))

        await bot.channels.cache.get("1023591799434006641").send({embeds: [Embed], components: [btn]})
        await message.reply(lang.bug(req[0].lang === "fr" ? `Votre rapport de bug de la commande \`${command.name}\` a bien été soumis au développeur avec succès !` : `Your report of the bug of the command \`${command.name}\` has been successfully transmitted to the developer !`))
    }
})
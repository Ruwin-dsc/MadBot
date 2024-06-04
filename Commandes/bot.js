const Discord = require("discord.js")
const os = require("os")
const moment = require("moment")
const setup = require("moment-duration-format")
const Command = require("../Structure/Command")
setup(moment)

module.exports = new Command({

    name: "bot",
    description: ["Permet d'avoir des informations sur le robot", "Allow to get informations about the bot"],
    utilisation: ["", ""],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Informations", "Informations"],
    cooldown: 2,

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)

        let user = 0;
        bot.guilds.cache.forEach(async guild => {
            user = guild.memberCount + user
        })

        await message.deferReply()

        if(req[0].lang === "fr") {

            let duration = moment.duration(bot.uptime).format(" D [day], H [hour], m [minute], s [second] ");

            if(duration.includes("second")) duration = duration.replace(/second/g, "seconde")
            if(duration.includes("seconds")) duration = duration.replace(/seconds/g, "secondes")
            if(duration.includes("hour")) duration = duration.replace(/hour/g, "heure")
            if(duration.includes("hours")) duration = duration.replace(/hours/g, "heures")
            if(duration.includes("day")) duration = duration.replace(/day/g, "jour")
            if(duration.includes("days")) duration = duration.replace(/days/g, "jours")


            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`${bot.function.emojis.bot} Informations sur le robot`)
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
            .addFields([{name: `${bot.function.emojis.arrow} **__Informations sur le robot__**`, value: `> ${bot.function.emojis.owner} **Propriétaire** : \`ruwinou\`\n> ${bot.function.emojis.bot_developer} **Développeur** : \`ruwinou\`\n> ${bot.function.emojis.bot} **Nom** : \`${bot.user.username}\`\n> ${bot.function.emojis.channel} **Tag** : \`${bot.user.discriminator}\`\n> ${bot.function.emojis.id} **Identifiant** : \`${bot.user.id}\`\n> ${bot.function.emojis.db} **Base de données** : \`MySQL\`\n> ${bot.function.emojis.discordjs} **Version de discord.js** : \`v${Discord.version.split("-")[0]}\`\n> ${bot.function.emojis.nodejs} **Version de node.js** : \`${process.version}\`\n> ${bot.function.emojis.online} **Temps de connexion** : \`${duration}\``}, {name: `${bot.function.emojis.arrow} **__Informations sur les statistiques__**`, value: `> ${bot.function.emojis.server} **Serveurs** : \`${bot.guilds.cache.size}\`\n> ${bot.function.emojis.user} **Utilisateurs** : \`${user}\`\n> ${bot.function.emojis.command} **Commandes** : \`${bot.commands.size}\`\n> ${bot.function.emojis.channel} **Salons** : \`${bot.channels.cache.size}\`\n> ${bot.function.emojis.emoji} **Emojis** : \`${bot.emojis.cache.size}\``}, {name: `${bot.function.emojis.arrow} **__Informations sur le système__**`, value: `> \`🚀\` **Hébergeur** : \`Chez le papa à Nekros\`\n> \`💾\` **Système** : \`${os.platform() === "linux" ? "Linux" : os.platform()}\`\n> \`💻\` **Processeur** : \`${os.cpus()[0].model}\`\n> \`⚙️\` **Utilisation de la RAM** : \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB\``}])
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Link)
            .setLabel("Add the bot")
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot%20applications.commands`),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Link)
            .setLabel("Support server")
            .setURL("https://discord.gg/QB3SN2YdN2"))

            message.followUp({ embeds: [Embed], components: [btn] })
        }

        if(req[0].lang === "en") {

            let duration = moment.duration(bot.uptime).format(" D [day], H [hour], m [minute], s [second] ");

            let Embed = new Discord.EmbedBuilder()
            .setColor(bot.color)
            .setTitle(`${bot.function.emojis.bot} Informations about the bot`)
            .setThumbnail(bot.user.displayAvatarURL({ dynamic: true }))
            .addFields([{name: `${bot.function.emojis.arrow} **__Informations about the bot__**`, value: `> ${bot.function.emojis.owner} **Owner** : \`Mad_Rage#3909\`\n> ${bot.function.emojis.bot_developer} **Developer** : \`Mad_Rage#3909\`\n> ${bot.function.emojis.bot} **Name** : \`${bot.user.username}\`\n> ${bot.function.emojis.channel} **Discriminator** : \`${bot.user.discriminator}\`\n> ${bot.function.emojis.id} **ID** : \`${bot.user.id}\`\n> ${bot.function.emojis.db} **Database** : \`MySQL\`\n> ${bot.function.emojis.discordjs} **Discord.js' version** : \`v${Discord.version.split("-")[0]}\`\n> ${bot.function.emojis.nodejs} **Node.js' version** : \`${process.version}\`\n> ${bot.function.emojis.online} **Connexion time** : \`${duration}\``}, {name: `${bot.function.emojis.arrow} **__Informations about the stats__**`, value: `> ${bot.function.emojis.server} **Servers** : \`${bot.guilds.cache.size}\`\n> ${bot.function.emojis.user} **Users** : \`${user}\`\n> ${bot.function.emojis.command} **Commands** : \`${bot.commands.size}\`\n> ${bot.function.emojis.channel} **Channels** : \`${bot.channels.cache.size}\`\n> ${bot.function.emojis.emoji} **Emojis** : \`${bot.emojis.cache.size}\``}, {name: `${bot.function.emojis.arrow} **__Informations about the system__**`, value: `> \`🚀\` **Hosting** : \`Nexus Games\`\n\n> \`💾\` **Platform** : \`${os.platform() === "linux" ? "Linux" : os.platform()}\`\n> \`💻\` **Processor** : \`${os.cpus()[0].model}\`\n> \`⚙️\` **RAM's utilisation** : \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB\``}])
            .setTimestamp()
            .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

            const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Link)
            .setLabel("Add the bot")
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot%20applications.commands`),
            new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Link)
            .setLabel("Support server")
            .setURL("https://discord.gg/QB3SN2YdN2"))

            message.followUp({ embeds: [Embed], components: [btn] })
        }
    }
})
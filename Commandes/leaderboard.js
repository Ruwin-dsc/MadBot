const Discord = require("discord.js")
const Canvas = require("discord-canvas-easy")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "leaderboard",
    description: ["Permet de connaître les 10 utilisateurs du serveur avec le plus d'expérience", "Allow to get the 10 users of the server with the most xp"],
    utilisation: ["", ""],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.AttachFiles, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageMessages],
    category: ["Expérience", "Experience"],
    cooldown: 10,

    async run(bot, message, args, db) {

        let l = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${l[0].lang}.js`)

        let req = await db.select("user", "guildID", message.guildId)
        if(req.length < 1) return message.reply(lang.error(l[0].lang === "fr" ? "Aucune personne n'a d'expérience !" : "No body has xp !"))

        await message.deferReply()

        const calculXp = (xp, level) => {
            let xptotal = 0;
            for (let i = 0; i < (parseInt(level) + 1); i++) xptotal = xptotal + (i * 1000)
            xptotal = xptotal + parseInt(xp)
            return xptotal;
        }

        const leaderboard = req.sort((a, b) => calculXp(b.xp, b.level) - calculXp(a.xp, a.level))

        let limit = 10;
        let border = limit <= leaderboard.length ? limit : leaderboard.length;

        let Leaderboard = await new Canvas.Leaderboard()
        .setBot(bot)
        .setBackground("./Assets/background_leaderboard.png")
        .setGuild(message.guild)
        .setColorFont("#ffffff")

        for (let i = 0; i < border; i++) {
            
            Leaderboard.addUser((await bot.users.fetch(leaderboard[i].userID)), parseInt(leaderboard[i].level), parseInt(leaderboard[i].xp), (parseInt(req[i].level) + 1) * 1000)
        }

        Leaderboard = (await Leaderboard.toLeaderboard()).toBuffer()

        await message.followUp({ files: [new Discord.AttachmentBuilder(Leaderboard, {name: 'leaderboard.png'})] })
    }
})
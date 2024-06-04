const Discord = require("discord.js")
const SlashCommand = require("../../Structure/SlashCommand")
const Event = require("../../Structure/Event");
const API = require("../../API/api");

module.exports = new Event("ready", async bot => {

    await SlashCommand(bot)
    await API(bot)

    console.log(`${bot.user.username} : En ligne sur ${bot.guilds.cache.size} serveur(s) !`)

    setInterval(async () => {

        let user = 0;
        bot.guilds.cache.forEach(async guild => {
            user = guild.memberCount + user
        })

        const activités = ["Ruwinou the developer", `${bot.guilds.cache.size} servers`, `${user} users`, `MadBot`]
        const activities = activités[Math.floor(Math.random() * activités.length)]

        await bot.user.setActivity(activities, { type: Discord.ActivityType.Watching })

    }, 15000)

    setInterval(async () => {

        let req = await bot.db.select("temp")

        for(let i = 0; i < req.length; i++) {

            if(Date.now() >= parseInt(req[i].date)) {

                let lang = await bot.db.selectGuild(req[i].guildID)
                const langfile = require(`../../Fonctions/${lang[0].lang}.js`)

                let reason = "Automatique"

                try {
                    await bot.guilds.cache.get(req[i].guildID).members.unban(await bot.users.fetch(req[i].userID), reason)
                } catch (err) { }
                await bot.db.delete("temp", "banID", req[i].banID)
                try {
                    (await bot.users.fetch(req[i].userID)).send(langfile.unban(lang[0].lang === "fr" ? `Vous avez été débanni du serveur \`${bot.guilds.cache.get(req[i].guildID).name}\` par \`${bot.user.tag}\` ! ${bot.function.emojis.complete}` : `You have been unbanned of the server \`${bot.guilds.cache.get(req[i].guildID).name}\` by \`${bot.user.tag}\` ! ${bot.function.emojis.complete}`) + "\n" + langfile.reason(reason))
                } catch (err) { }
            }
        }

    }, 1000)
})
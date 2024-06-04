const Event = require("../../Structure/Event")

module.exports = new Event("voiceStateUpdate", async (bot, oldVoice, newVoice) => {

    const db = bot.db;

    const newv = oldVoice.guild.channels.cache.get(newVoice.channelId)
    const oldv = oldVoice.guild.channels.cache.get(oldVoice.channelId)
    const user = oldVoice.guild.members.cache.get(oldVoice.id).user || newVoice.guild.members.cache.get(newVoice.id).user

    if (user.bot) return;

    if (!oldv && newv) db.insert("voc", ["ID", "guildID", "userID", "date"], [`${newv.guildId} ${user.id}`, newv.guildId, user.id, `${Date.now()}`])

    if (oldv && newv) {

        let req = await db.select("voc", "ID", `${oldv.guildId} ${user.id}`)
        let XP = await db.selectUser(oldv.guildId, user.id)

        if (req.length < 1) return;

        const xp = Math.round(((Date.now() - parseInt(req[0].date)) / 30000) * (Math.floor(Math.random() * 24) + 1))
        if (XP.length < 1) {
            db.insert("user", ["ID", "guildID", "userID", "xp", "level"], [`${oldv.guildId} ${user.id}`, oldv.guildId, user.id, `${xp}`, "0"])
        } else db.update("user", "xp", `${parseInt(XP[0].xp) + xp}`, "ID", `${oldv.guildId} ${user.id}`)
        await db.delete("voc", "ID", `${oldv.guildId} ${user.id}`)
        db.insert("voc", ["ID", "guildID", "userID", "date"], [`${newv.guildId} ${user.id}`, newv.guildId, user.id, `${Date.now()}`])
    }

    if (oldv && !newv) {

        let req = await db.select("voc", "ID", `${oldv.guildId} ${user.id}`)
        let XP = await db.selectUser(oldv.guildId, user.id)

        if (req.length < 1) return;

        const xp = Math.round(((Date.now() - parseInt(req[0].date)) / 30000) * (Math.floor(Math.random() * 24) + 1))
        if (XP.length < 1) {
            db.insert("user", ["ID", "guildID", "userID", "xp", "level"], [`${oldv.guildId} ${user.id}`, oldv.guildId, user.id, `${xp}`, "0"])
        } else db.update("user", "xp", `${parseInt(XP[0].xp) + xp}`, "ID", `${oldv.guildId} ${user.id}`)
        await db.delete("voc", "ID", `${oldv.guildId} ${user.id}`)
    }
})
const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "unlock",
    description: ["Permet de déverouiller un salon", "Allow to unlock a channel"],
    utilisation: ["[salon] (raison)", "[channel] (reason)"],
    permission: Discord.PermissionFlagsBits.ManageChannels,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageChannels],
    category: ["Modération", "Moderation"],
    cooldown: 10,
    options: [
        {
            type: "channel",
            name: ["salon", "channel"],
            description: ["Le salon à déverrouiller", "The channel to unlock"],
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: ["raison", "reason"],
            description: ["La raison du déverrouillage", "The reason to the unlock"],
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)

        try {

            let channel = await bot.channels.fetch(args._hoistedOptions[0].value)
            if(!channel) return message.reply(lang.error(req[0].lang === "fr" ? "Aucun salon trouvé !" : "No channel found !"))
            if(!message.guild.channels.cache.get(channel.id)) return message.reply(lang.error(req[0].lang === "fr" ? "Aucun salon trouvé !" : "No channel found !"))
            if(channel.type !== Discord.ChannelType.GuildText) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un salon textuel !" : "Please indicate a textual channel !"))

            let reason = args.getString("reason")
            if(!reason) reason = req[0].lang === "fr" ? "Aucune raison spécifiée" : "No reason specified";

            let role = message.guild.roles.everyone;

            if(!channel.permissionOverwrites.cache.get(role.id)?.deny.toArray(false).includes("SendMessages")) return message.reply(lang.error(req[0].lang === "fr" ? `Ce salon est déjà déverrouillé !` : `This channel is already unlocked !`))

            await channel.permissionOverwrites.create(role, {
                SendMessages: true
            })

            await message.reply(lang.unlock(req[0].lang === "fr" ? `${message.user} a déverouillé le salon ${channel} avec succès ! ${bot.function.emojis.complete}` : `${message.user} unlocked the channel ${channel} with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason))
            await bot.emit("channelUnlock", channel, message.user, reason)

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucun salon trouvé !" : "No channel found !"))
        }
    }
})
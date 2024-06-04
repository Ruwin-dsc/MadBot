const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "lock",
    description: ["Permet de verouiller un salon", "Allow to lock a channel"],
    utilisation: ["[salon] (raison)", "[channel] (reason)"],
    permission: Discord.PermissionFlagsBits.ManageChannels,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageMessages, Discord.PermissionFlagsBits.ManageChannels],
    category: ["Modération", "Moderation"],
    cooldown: 10,
    options: [
        {
            type: "channel",
            name: ["salon", "channel"],
            description: ["Le salon à verrouillage", "The channel to lock"],
            required: true,
            autocomplete: false
        }, {
            type: "string",
            name: ["raison", "reason"],
            description: ["La raison du verrouillage", "The reason to the lock"],
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

            if(channel.permissionOverwrites.cache.get(role.id)?.deny.toArray(false).includes("SendMessages")) return message.reply(lang.error(req[0].lang === "fr" ? `Ce salon est déjà verouillé !` : `This channel is already locked !`))

            await channel.permissionOverwrites.create(role, {
                SendMessages: false
            })

            const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Danger)
            .setCustomId(`unlock_${channel.id}`)
            .setLabel(req[0].lang === "fr" ? "Déverrouillage" : "Unlock"))

            await message.reply({ content: lang.lock(req[0].lang === "fr" ? `${message.user} a verouillé le salon ${channel} avec succès ! ${bot.function.emojis.complete}` : `${message.user} locked the channel ${channel} with success ! ${bot.function.emojis.complete}`) + "\n" + lang.reason(reason), components: [btn] })
            await bot.emit("channelLock", channel, message.user, reason)

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucun salon trouvé !" : "No channel found !"))
        }
    }
})
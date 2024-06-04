const Discord = require("discord.js")
const ms = require("ms")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "slowmode",
    description: ["Permet de ralentir un salon", "Allow to slow a channel"],
    utilisation: ["[temps] (salon)", "[time] (channel)"],
    permission: Discord.PermissionFlagsBits.ManageChannels,
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageChannels],
    category: ["Modération", "Moderation"],
    cooldown: 5,
    options: [
        {
            type: "string",
            name: ["temps", "time"],
            description: ["Le temps du ralentissement", "The time to the slowmode"],
            required: true,
            autocomplete: false
        }, {
            type: "channel",
            name: ["salon", "channel"],
            description: ["Le salon ralenti", "The channel in the slowmode"],
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${req[0].lang}.js`)

        try {

            let time = args.getString("channel");
            if(!time) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un temps inférieur ou égal à \`6h\` !" : "Please indicate a time less than or equal to \`6h\` !"))
            if(isNaN(ms(time))) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un temps inférieur ou égal à \`6h\` !" : "Please indicate a time less than or equal to \`6h\` !"))
            if(parseInt(time) < 0 || parseInt(time) > 21610000) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un temps inférieur ou égal à \`6h\` !" : "Please indicate a time less than or equal to \`6h\` !"))

            let channel;
            if(args._hoistedOptions.length) {
                channel = await bot.channels.fetch(args._hoistedOptions[1].value)
                if(!channel) return message.reply(lang.error(req[0].lang === "fr" ? "Aucun salon trouvé !" : "No channel found !"))
                if(channel.guild.id !== message.guildId) return message.reply(lang.error(req[0].lang === "fr" ? "Aucun salon trouvé !" : "No channel found !"))
            } else channel = message.channel;
            if(channel.type !== Discord.ChannelType.GuildText) return message.reply(lang.error(req[0].lang === "fr" ? "Veuillez indiquer un salon textuel !" : "Please indicate a textual channel !"))
            if(channel.rateLimitPerUser === parseInt(time)) return message.reply(lang.error(req[0].lang === "fr" ? `Ce salon est déjà ralenti de \`${time}\` !` : `This channel is already slowed for \`${time}\` !`))

            const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
            .setStyle(Discord.ButtonStyle.Danger)
            .setCustomId(`unslowmode_${channel.id}`)
            .setLabel(req[0].lang === "fr" ? "Annuler le ralentissement" : "Unslowmode"))

            await message.reply({ content: lang.slowmode(req[0].lang === "fr" ? `${message.user} a ralenti le salon ${channel} de \`${time}\` avec succès !` : `${message.user} slowed the channel ${channel} for \`${time}\` with success !`), components: [btn] })

            await channel.setRateLimitPerUser(parseInt(time))
            await bot.emit("channelSlowmode", channel, message.user, time, message.guild)

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucun salon trouvé !" : "No channel found !"))
        }
    }
})
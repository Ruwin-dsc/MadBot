const Discord = require("discord.js")
const { time } = require("@discordjs/builders")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "user",
    description: ["Permet d'avoir des informations sur un utilisateur", "Allow to get informations about a user"],
    utilisation: ["(membre)", "(member)"],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Informations", "Informations"],
    cooldown: 2,
    options: [
        {
            type: "user",
            name: ["membre", "member"],
            description: ["L'utilisateur à afficher", "The user to display"],
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let req = await db.selectGuild(message.guildId)
        const lang = bot.function[req[0].lang]

        try {

            let user;
            if(args._hoistedOptions.length > 0) {
                user = await bot.users.fetch(args._hoistedOptions[0].value)
                if(!user) return message.reply(lang.error(req[0].lang === "fr" ? "Aucune personne trouvé !" : "No person found !"))
            } else user = message.user;

            await message.deferReply()

            const status = {
                online: bot.function.emojis.online,
                dnd: bot.function.emojis.dnd,
                streaming: bot.function.emojis.streaming,
                idle: bot.function.emojis.idle,
                offline: bot.function.emojis.offline
            }

            const member = message.guild.members.cache.get(user.id)

            let badge = member ? message.guild.ownerId === user.id ? bot.function.emojis.owner : "" : "";
            if(user.displayAvatarURL({ dynamic: true }).endsWith(".gif") || (member ? member.presence ? member.presence.activities[0] ? member.presence.activities[0].emoji !== null ? member.presence.activities[0].emoji.id !== undefined : "" : "" : "" : "") || (member ? member.premiumSinceTimestamp !== null : "") || (await bot.users.fetch(user.id, {force: true})).banner) badge += bot.function.emojis.nitro;
            if(member && member.premiumSinceTimestamp !== null) badge += (Date.now() - member.premiumSinceTimestamp >= 63115200000 ? bot.function.emojis.boost_24months : Date.now() - member.premiumSinceTimestamp >= 47336400000 ? bot.function.emojis.boost_18months : Date.now() - member.premiumSinceTimestamp >= 39447000000 ? bot.function.emojis.boost_15months : Date.now() - member.premiumSinceTimestamp >= 31557600000 ? bot.function.emojis.boost_12months : Date.now() - member.premiumSinceTimestamp >= 23668200000 ? bot.function.emojis.boost_9months : Date.now() - member.premiumSinceTimestamp >= 15778800000 ? bot.function.emojis.boost_6months : Date.now() - member.premiumSinceTimestamp >= 7889400000 ? bot.function.emojis.boost_3months : Date.now() - member.premiumSinceTimestamp >= 5259600000 ? bot.function.emojis.boost_2months : bot.function.emojis.boost_1month)
            if((await user.fetchFlags()).toArray().includes("Staff")) badge += `${bot.function.emojis.discord_staff}`;
            if((await user.fetchFlags()).toArray().includes("Partner")) badge += `${bot.function.emojis.partner_server}`;
            if((await user.fetchFlags()).toArray().includes("Hypesquad")) badge += `${bot.function.emojis.hypesquad_event}`;
            if((await user.fetchFlags()).toArray().includes("BugHunterLevel1")) badge += `${bot.function.emojis.bug_hunter1}`;
            if((await user.fetchFlags()).toArray().includes("HypeSquadOnlineHouse1")) badge += `${bot.function.emojis.house_bravery}`;
            if((await user.fetchFlags()).toArray().includes("HypeSquadOnlineHouse2")) badge += `${bot.function.emojis.house_brilliance}`;
            if((await user.fetchFlags()).toArray().includes("HypeSquadOnlineHouse3")) badge += `${bot.function.emojis.house_balance}`;
            if((await user.fetchFlags()).toArray().includes("PremiumEarlySupporter")) badge += `${bot.function.emojis.early_supporter}`;
            if((await user.fetchFlags()).toArray().includes("BugHunterLevel1")) badge += `${bot.function.emojis.bug_hunter2}`;
            if((await user.fetchFlags()).toArray().includes("VerifiedDeveloper")) badge += `${bot.function.emojis.bot_developer}`;
            if((await user.fetchFlags()).toArray().includes("CertifiedModerator")) badge += `${bot.function.emojis.certified_moderator}`;
            if(badge === "") badge = req[0].lang === "fr" ? "\`Aucun\`" : "\`No\`"

            if(req[0].lang === "fr") {

                let Embed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.user} Informations sur l'utilisateur ${user.tag}`)
                .setThumbnail(member ? member.avatar ? member.avatarURL({ dynamic: true }) : user.displayAvatarURL({ dynamic: true }) : user.displayAvatarURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.arrow} **__Informations sur l'utilisateur__**`, value: `> ${bot.function.emojis.user} **Nom** : \`${user.username}\` ${user}\n> ${bot.function.emojis.channel} **Tag** : \`${user.discriminator}\`\n> ${bot.function.emojis.id} **Identifiant** : \`${user.id}\`\n> ${bot.function.emojis.robot} **Robot** : \`${user.bot ? "Oui" : "Non"}\`\n> ${bot.function.emojis.statut} **Status** : ${member ? member.presence ? status[member.presence.status] : bot.function.emojis.offline : bot.function.emojis.offline}\n> ${bot.function.emojis.badge} **Badges** : ${badge}\n> ${bot.function.emojis.emoji} **Statut personnalisé** : \`${member ? member.presence === null ? "Aucun" : member.presence.activities[0] ? member.presence.activities[0].type === Discord.ActivityType.Custom ? member.presence.activities[0].state === "" || member.presence.activities[0].state === null ? "Aucun" : member.presence.activities[0].state : "Aucun" : "Aucun" : "Aucun"}\`\n> ${bot.function.emojis.activity} **Activité** : \`${member ? `${member.presence ? member.presence.activities[1] ? member.presence.activities[1].type === Discord.ActivityType.Watching ? "Regarde" : member.presence.activities[1].type === Discord.ActivityType.Playing ? "Joue à" : member.presence.activities[1].type === Discord.ActivityType.Streaming ? "Streame" : member.presence.activities[1].type === Discord.ActivityType.Listening ? "Ecoute" : member.presence.activities[1].type === Discord.ActivityType.Competing ? "Participant à" : "" : "Aucune" : "Aucune"}${member.presence ? member.presence.activities[1] ? member.presence.activities[1].name !== "" ? ` ${member.presence.activities[1].name}` : "" : "" : ""}` : "Aucune"}\`\n> ${bot.function.emojis.platform} **Plateforme de connexion** : \`${member ? member.presence ? member.presence.clientStatus.desktop ? "Ordinateur" : member.presence.clientStatus.web ? "Internet" : member.presence.clientStatus.mobile ? "Téléphone" : "Aucune" : "Aucune" : "Aucune"}\`\n> ${bot.function.emojis.creation_account} **Date de création du compte** : ${time(user.createdAt, "F")} \`(il y a ${((Date.now() - user.createdAt) / 86400000).toFixed(0)} ${(Date.now() - user.createdAt) / 86400000 <= 1 ? "jour" : "jours"})\``}, {name: `${bot.function.emojis.arrow} **__Informations sur le membre__**`, value: `> ${bot.function.emojis.nickname} **Surnom** : \`${member ? member.nickname === null ? "Aucun" : member.nickname : "Aucun"}\`\n> ${bot.function.emojis.joined} **Date d'arrivé** : ${member ? `${time(member.joinedAt, "F")} \`(il y a ${((Date.now() - member.joinedAt) / 86400000).toFixed(0)} ${(Date.now() - member.joinedAt) / 86400000 <= 1 ? "jour" : "jours"})\`` : "\`Jamais arrivé\`"}\n> ${bot.function.emojis.role} **Rôle le plus haut** : ${member ? member.roles.highest : "\`Aucun\`"}`}])
                .setImage((await bot.users.fetch(user.id, { force: true })).bannerURL({ dynamic: true, size: 4096 }))
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                message.followUp({ embeds: [Embed] })
            }

            if(req[0].lang === "en") {

                let Embed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setTitle(`${bot.function.emojis.user} Informations about the user ${user.tag}`)
                .setThumbnail(member ? member.avatar ? member.avatarURL({ dynamic: true }) : user.displayAvatarURL({ dynamic: true }) : user.displayAvatarURL({ dynamic: true }))
                .addFields([{name: `${bot.function.emojis.arrow} **__Informations about the user__**`, value: `> ${bot.function.emojis.user} **Name** : \`${user.username}\` ${user}\n> ${bot.function.emojis.channel} **Discriminator** : \`${user.discriminator}\`\n> ${bot.function.emojis.id} **ID** : \`${user.id}\`\n> ${bot.function.emojis.robot} **Bot** : \`${user.bot ? "Yes" : "No"}\`\n> ${bot.function.emojis.statut} **Statut** : ${member ? member.presence ? status[member.presence.status] : bot.function.emojis.offline : bot.function.emojis.offline}\n> ${bot.function.emojis.badge} **Badge** : ${badge}\n> ${bot.function.emojis.emoji} **Custom statut** : \`${member ? member.presence === null ? "No" : member.presence.activities[0] ? member.presence.activities[0].type === Discord.ActivityType.Custom ? member.presence.activities[0].state === "" || member.presence.activities[0].state === null ? "No" : member.presence.activities[0].state : "No" : "No" : "No"}\`\n> ${bot.function.emojis.activity} **Activity** : \`${member ? `${member.presence ? member.presence.activities[1] ? member.presence.activities[1].type === Discord.ActivityType.Watching ? "Watching" : member.presence.activities[1].type === Discord.ActivityType.Playing ? "Playing at" : member.presence.activities[1].type === Discord.ActivityType.Streaming ? "Streaming" : member.presence.activities[1].type === Discord.ActivityType.Listening ? "Listening" : member.presence.activities[1].type === Discord.ActivityType.Competing ? "Competing to" : "No" : "No" : "No"}${member.presence ? member.presence.activities[1] ? member.presence.activities[1].name !== "" ? ` ${member.presence.activities[1].name}` : "" : "" : ""}` : "No"}\`\n> ${bot.function.emojis.platform} **Platform of the connexion** : \`${member ? member.presence ? member.presence.clientStatus.desktop ? "Desktop" : member.presence.clientStatus.web ? "Web" : member.presence.clientStatus.mobile ? "Phone" : "No" : "No" : "No"}\`\n> ${bot.function.emojis.creation_account} **Creation date of the account** : ${time(user.createdAt, "F")} \`(there are ${((Date.now() - user.createdAt) / 86400000).toFixed(0)} ${(Date.now() - user.createdAt) / 86400000 <= 1 ? "day" : "days"})\``}, {name: `${bot.function.emojis.arrow} **__Informations about the member__**`, value: `> ${bot.function.emojis.nickname} **Nickname** : \`${member ? member.nickname === null ? "No" : member.nickname : "No"}\`\n> ${bot.function.emojis.joined} **Arrival date** : ${member ? `${time(member.joinedAt, "F")} \`(there are ${((Date.now() - member.joinedAt) / 86400000).toFixed(0)} ${(Date.now() - member.joinedAt) / 86400000 <= 1 ? "day" : "days"})\`` : "\`Never joined\`"}\n> ${bot.function.emojis.role} **Hightest role** : ${member ? member.roles.highest : "No role"}`}])
                .setImage((await bot.users.fetch(user.id, { force: true })).bannerURL({ dynamic: true, size: 4096 }))
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                message.followUp({ embeds: [Embed] })
            }

        } catch (err) {

            return message.reply(lang.error(req[0].lang === "fr" ? "Aucun utilisateur trouvé !" : "No user found !"))
        }
    }
})
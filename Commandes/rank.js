const Discord = require("discord.js")
const Canvas = require("canvas")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "rank",
    description: ["Permet de connaître le niveau d'expérience d'un utilisateur", "Allow to get the xp's level of a user"],
    utilisation: ["(membre)", "(member)"],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.AttachFiles, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Expérience", "Experience"],
    cooldown: 10,
    options: [
        {
            type: "user",
            name: ["membre", "member"],
            description: ["L'expérience de l'utilisateur à afficher", "The xp of the user to display"],
            required: false,
            autocomplete: false
        }
    ],

    async run(bot, message, args, db) {

        let l = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${l[0].lang}.js`)

        try {

            let user;
            if(args._hoistedOptions.length > 0) {
                user = await bot.users.fetch(args._hoistedOptions[0].value)
                if(!user) return message.reply(lang.error(l[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
            } else user = message.user;
            if(user.bot) return message.reply(lang.error(l[0].lang === "fr" ? "Les robots n'ont pas d'expérience !" : "Bots don't have any xp !"))

            await message.deferReply()

            let req = await db.selectUser(message.guildId, user.id)
            let all = await db.select("user", "guildID", message.guildId)

            const calculXp = (xp, level) => {
                let xptotal = 0;
                for (let i = 0; i < (parseInt(level) + 1); i++) xptotal = xptotal + (i * 1000)
                xptotal = xptotal + parseInt(xp)
                return xptotal;
            }

            const leaderboard = all.sort((a, b) => calculXp(b.xp, b.level) - calculXp(a.xp, a.level))
            const rank = req.length < 1 ? (all.length + 1) : leaderboard.findIndex(u => u.userID === user.id) + 1
            let xp = req.length < 1 ? 0 : parseInt(req[0].xp)
            let level = req.length < 1 ? 0 : parseInt(req[0].level)
            let need = req.length < 1 ? 1000 : ((parseInt(req[0].level) + 1) * 1000)
            const badges = await user.fetchFlags();
            const badge = badges.toArray().filter(b => b !== "BotHTTPInteractions" && b !== "Quarantined" && b !== "Spammer" && b !== "TeamPseudoUser" && b !== "VerifiedBot");
            const member = message.guild.members.cache.get(user.id);
            const status = member ? member.presence ? member.presence?.activities[0]?.type === "STREAMING" ? "stream" : member.presence.status ? member.presence.status : "offline" : "offline" : "offline";

            const colOnline = "#3ba55c";
            const colDnd = "#ed4245";
            const colStream = "#593695";
            const colIdle = "#faa61a";
            const colOffline = "#747f8d";

            const canvas = Canvas.createCanvas(800, 600);
            const ctx = canvas.getContext('2d');
            Canvas.registerFont(`./Assets/Fonts/bebasneue.ttf`, { family: "bebasneue" })
            Canvas.registerFont('./Assets/Fonts/mistral.ttf', { family: 'mistral' })

            const background = await Canvas.loadImage(`./Assets/background_rank.png`)
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            ctx.beginPath()
            ctx.moveTo(0, 50)
            ctx.lineTo(750, 50);
            ctx.quadraticCurveTo(800, 50, 800, 100);
            ctx.lineTo(canvas.width, 320)
            ctx.lineTo(0, 320)
            ctx.lineTo(0, 50)
            ctx.stroke()
            ctx.save()
            ctx.clip()

            const banner = await Canvas.loadImage((await bot.users.fetch(user.id, { force: true })).banner ? (await bot.users.fetch(user.id, { force: true })).bannerURL({ extension: 'jpg', size: 512 }) : "./Assets/banner_rank.jpg")
            ctx.drawImage(banner, 0, 50, canvas.width, 270);
            ctx.restore()
            if(xp > need) xp = need;
            if(xp < 0) xp = 0;

            const percentage = Math.floor(xp / need * 100);
            const roundedPercent = Math.round(percentage);

            for(i = 0; i < roundedPercent; i++) {
                ctx.beginPath()
                ctx.lineWidth = 8
                ctx.strokeStyle = status === "online" ? colOnline : status === "dnd" ? colDnd : status === "stream" ? colStream : status === "idle" ? colIdle : status === "offline" ? colOffline : "#f25858"
                ctx.fillStyle = status === "online" ? colOnline : status === "dnd" ? colDnd : status === "stream" ? colStream : status === "idle" ? colIdle : status === "offline" ? colOffline : "#f25858"
                ctx.arc(200 + (i * 4.75), 560, 8, 0, Math.PI * 2, true)
                ctx.stroke()
                ctx.fill()
            }

            // Pourcentage %
            ctx.font = '32px mistral'
            ctx.fillStyle = "#eeeeee";
            ctx.textAlign = 'left';
            ctx.fillText(`${Math.floor(xp * 100 / need)}%`, 710, 570)

            // XP
            ctx.font = '32px bebasneue'
            ctx.fillStyle = "#eeeeee";
            ctx.textAlign = 'right';
            ctx.fillText(`${xp} / ${need} xp`, 690, 530)

            // Rang Chiffre
            ctx.font = '150px bebasneue'
            ctx.fillStyle = "#f25858";
            ctx.textAlign = 'center';
            ctx.textBaseline = "bottom";
            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";
            ctx.fillText(rank, 575, 340)

            // Rang texte
            ctx.font = '48px mistral'
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = 'center';
            ctx.textBaseline = "bottom";
            ctx.shadowBlur = 6;
            ctx.shadowColor = "#000000";
            ctx.fillText(`Rang`, 575, 315)
            ctx.shadowBlur = 0;

            // Level Chiffre
            ctx.font = '150px bebasneue'
            ctx.fillStyle = "#f25858";
            ctx.textAlign = 'center';
            ctx.textBaseline = "bottom";
            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";
            ctx.fillText(level, 700, 340)

            // Level Texte
            ctx.font = '48px mistral'
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = 'center';
            ctx.textBaseline = "bottom";
            ctx.shadowBlur = 6;
            ctx.shadowColor = "#000000";
            ctx.fillText(`Niveau`, 700, 315)
            ctx.shadowBlur = 0;

            // Tag de l'utilisateur
            ctx.font = '64px bebasneue'
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = 'left';
            ctx.fillText(`${user.username.length > 15 ? user.username.slice(0, 12) + "..." : user.username}`, 50, 540)

            // Discriminator de l'utilisateur
            // ctx.font = '48px mistral'
            // ctx.fillStyle = "#f25858";
            // ctx.textAlign = 'left';
            // ctx.fillText(`#${user.discriminator}`, 50, 580)

            // Badge de l'utilisateur                    
            if(badges.bitfield !== 0) {

                for (let i = 0; i < badge.length; i++) {
                    console.log(badge[i])
                    if(badge[i] === "HypeSquadOnlineHouse1") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/885911154868748318.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(badge[i] === "HypeSquadOnlineHouse2") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/885911240319324240.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(badge[i] === "HypeSquadOnlineHouse3") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/885911094319804476.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(badge[i] === "Staff") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/885910656325410827.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(badge[i] === "Partner") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/885911476580253806.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(badge[i] === "Hypesquad") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/885911355142569985.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(badge[i] === "BugHunterLevel1") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/885910368336117902.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(badge[i] === "BugHunterLevel2") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/885910424506204160.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(badge[i] === "PremiumEarlySupporter") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/885910855571619872.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(badge[i] === "VerifiedDeveloper") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/885911544884498492.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(badge[i] === "CertifiedModerator") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/1057351259109200053.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(badge[i] === "ActiveDeveloper") {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/1057351487937851432.png?v=1")
                        ctx.drawImage(b, 360 + i * 64, 345, 50, 50)
                    }
                    if(i === (badge.length - 1)) {
                        if((await message.guild.fetchOwner()).id === user.id) {
                            const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/832979220387856385.png?v=1")
                            ctx.drawImage(b, 360 + (i + 1) * 64, 345, 50, 50)
                        }
                        if(member && member.premiumSinceTimestamp !== null) {
                            if((await message.guild.fetchOwner()).id === user.id) {
                                const b = await Canvas.loadImage(Date.now() - member.premiumSinceTimestamp >= 63115200000 ? "https://cdn.discordapp.com/emojis/885885300721741874.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 47336400000 ? "https://cdn.discordapp.com/emojis/885885268538851379.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 39447000000 ? "https://cdn.discordapp.com/emojis/885885230945296384.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 31557600000 ? "https://cdn.discordapp.com/emojis/885885188457001070.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 23668200000 ? "https://cdn.discordapp.com/emojis/885885137802366996.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 15778800000 ? "https://cdn.discordapp.com/emojis/885885091652440104.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 7889400000 ? "https://cdn.discordapp.com/emojis/885885056814575697.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 5259600000 ? "https://cdn.discordapp.com/emojis/885885020269584404.png?size=96" : "https://cdn.discordapp.com/emojis/885884977831620708.png?size=96")
                                ctx.drawImage(b, 360 + (i + 2) * 64, 345, 50, 50)
                            } else {
                                const b = await Canvas.loadImage(Date.now() - member.premiumSinceTimestamp >= 63115200000 ? "https://cdn.discordapp.com/emojis/885885300721741874.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 47336400000 ? "https://cdn.discordapp.com/emojis/885885268538851379.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 39447000000 ? "https://cdn.discordapp.com/emojis/885885230945296384.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 31557600000 ? "https://cdn.discordapp.com/emojis/885885188457001070.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 23668200000 ? "https://cdn.discordapp.com/emojis/885885137802366996.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 15778800000 ? "https://cdn.discordapp.com/emojis/885885091652440104.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 7889400000 ? "https://cdn.discordapp.com/emojis/885885056814575697.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 5259600000 ? "https://cdn.discordapp.com/emojis/885885020269584404.png?size=96" : "https://cdn.discordapp.com/emojis/885884977831620708.png?size=96")
                                ctx.drawImage(b, 360 + (i + 1) * 64, 345, 50, 50)
                            }
                        }
                        if(user.displayAvatarURL({ dynamic: true }).endsWith(".gif") || (member ? member.presence ? member.presence.activities[0] ? member.presence.activities[0].emoji !== null ? member.presence.activities[0].emoji.id !== undefined : "" : "" : "" : "") || (member ? member.premiumSinceTimestamp !== null : "") || (await bot.users.fetch(user.id, { force: true })).banner) {
                            if((await message.guild.fetchOwner()).id === user.id && member && member.premiumSinceTimestamp !== null) {
                                const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/838059673700663316.png?v=1")
                                ctx.drawImage(b, 360 + (i + 3) * 64, 345, 72, 50)
                            } else if((await message.guild.fetchOwner()).id === user.id && member && member.premiumSinceTimestamp === null) {
                                const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/838059673700663316.png?v=1")
                                ctx.drawImage(b, 360 + (i + 2) * 64, 345, 72, 50)
                            } else if((await message.guild.fetchOwner()).id !== user.id && member && member.premiumSinceTimestamp !== null) {
                                const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/838059673700663316.png?v=1")
                                ctx.drawImage(b, 360 + (i + 2) * 50, 345, 72, 50)
                            } else {
                                const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/838059673700663316.png?v=1")
                                ctx.drawImage(b, 360 + (i + 1) * 64, 345, 72, 50)
                            }
                        }
                    }
                }

            } else {

                if((await message.guild.fetchOwner()).id === user.id) {
                    const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/832979220387856385.png?v=1")
                    ctx.drawImage(b, 360, 345, 64, 50)
                }
                if(member && member.premiumSinceTimestamp !== null) {
                    if((await message.guild.fetchOwner()).id === user.id) {
                        const b = await Canvas.loadImage(Date.now() - member.premiumSinceTimestamp >= 63115200000 ? "https://cdn.discordapp.com/emojis/885885300721741874.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 47336400000 ? "https://cdn.discordapp.com/emojis/885885268538851379.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 39447000000 ? "https://cdn.discordapp.com/emojis/885885230945296384.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 31557600000 ? "https://cdn.discordapp.com/emojis/885885188457001070.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 23668200000 ? "https://cdn.discordapp.com/emojis/885885137802366996.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 15778800000 ? "https://cdn.discordapp.com/emojis/885885091652440104.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 7889400000 ? "https://cdn.discordapp.com/emojis/885885056814575697.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 5259600000 ? "https://cdn.discordapp.com/emojis/885885020269584404.png?size=96" : "https://cdn.discordapp.com/emojis/885884977831620708.png?size=96")
                        ctx.drawImage(b, 360 + 64, 345, 64, 50)
                    } else {
                        const b = await Canvas.loadImage(Date.now() - member.premiumSinceTimestamp >= 63115200000 ? "https://cdn.discordapp.com/emojis/885885300721741874.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 47336400000 ? "https://cdn.discordapp.com/emojis/885885268538851379.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 39447000000 ? "https://cdn.discordapp.com/emojis/885885230945296384.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 31557600000 ? "https://cdn.discordapp.com/emojis/885885188457001070.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 23668200000 ? "https://cdn.discordapp.com/emojis/885885137802366996.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 15778800000 ? "https://cdn.discordapp.com/emojis/885885091652440104.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 7889400000 ? "https://cdn.discordapp.com/emojis/885885056814575697.png?size=96" : Date.now() - member.premiumSinceTimestamp >= 5259600000 ? "https://cdn.discordapp.com/emojis/885885020269584404.png?size=96" : "https://cdn.discordapp.com/emojis/885884977831620708.png?size=96")
                        ctx.drawImage(b, 360, 345, 64, 50)
                    }
                }
                if(user.displayAvatarURL({ dynamic: true }).endsWith(".gif") || (member ? member.presence ? member.presence.activities[0] ? member.presence.activities[0].emoji !== null ? member.presence.activities[0].emoji.id !== undefined : "" : "" : "" : "") || (member ? member.premiumSinceTimestamp !== null : "") || (await bot.users.fetch(user.id, { force: true })).banner) {
                    if((await message.guild.fetchOwner()).id === user.id && member && member.premiumSinceTimestamp !== null) {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/838059673700663316.png?v=1")
                        ctx.drawImage(b, 360 + 128, 345, 72, 50)
                    } else if((await message.guild.fetchOwner()).id === user.id && member && member.premiumSinceTimestamp === null) {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/838059673700663316.png?v=1")
                        ctx.drawImage(b, 360 + 64, 345, 72, 50)
                    } else if((await message.guild.fetchOwner()).id !== user.id && member && member.premiumSinceTimestamp !== null) {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/838059673700663316.png?v=1")
                        ctx.drawImage(b, 360 + 64, 345, 72, 50)
                    } else {
                        const b = await Canvas.loadImage("https://cdn.discordapp.com/emojis/838059673700663316.png?v=1")
                        ctx.drawImage(b, 360, 345, 72, 50)
                    }
                }
            }

            // AVATAR
            ctx.beginPath()
            ctx.globalAlpha = 1;
            ctx.lineWidth = 20
            ctx.strokeStyle = "#171717"
            ctx.arc(168, 320, 128, 0, Math.PI * 2, true)
            ctx.stroke()
            ctx.save()
            ctx.clip()
            const avatar = await Canvas.loadImage(member ? member.avatar ? member.avatarURL({ extension: 'png', size: 512 }) : user.displayAvatarURL({ extension: 'png', size: 512 }) : user.displayAvatarURL({ extension: 'png', size: 512 }))
            ctx.drawImage(avatar, 40, 192, 256, 256)
            ctx.restore();
            ctx.closePath()

            // STATUS
            if(status === "online") {
                const status = await Canvas.loadImage(`./Assets/Status/online.png`)
                ctx.drawImage(status, 210, 410, 48, 48);
            } else if(status === "dnd") {
                const status = await Canvas.loadImage(`./Assets/Status/dnd.png`)
                ctx.drawImage(status, 210, 410, 48, 48);
            } else if(status === "stream") {
                const status = await Canvas.loadImage(`./Assets/Status/stream.png`)
                ctx.drawImage(status, 210, 410, 48, 48);
            } else if(status === "idle") {
                const status = await Canvas.loadImage(`./Assets/Status/idle.png`)
                ctx.drawImage(status, 210, 410, 48, 48);
            } else if(status === "offline") {
                const status = await Canvas.loadImage(`./Assets/Status/offline.png`)
                ctx.drawImage(status, 210, 410, 48, 48);
            }

            message.followUp({ files: [new Discord.AttachmentBuilder(canvas.toBuffer(), {name: 'rank.png'})] })

        } catch (err) {
            console.log(err)
            return message.reply(lang.error(l[0].lang === "fr" ? "Aucune personne trouvée !" : "No person found !"))
        }
    }
})
const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "chicken",
    description: ["Permet de miser une quantité d'expérience sur le jeu du poulet", "Allow to bet a xp's quantity on the chicken game"],
    utilisation: ["[mise] [nombre d'os]", "[bet] [number of bones]"],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Expérience", "Experience"],
    cooldown: 120,
    options: [
        {
            type: "number",
            name: ["mise", "bet"],
            description: ["La mise à parier", "The bet to bet"],
            required: true,
            autocomplete: false
        }, {
            type: "number",
            name: ["os", "bone"],
            description: ["Le nombre d'os", "The number of bones"],
            required: true,
            autocomplete: false
        },
    ],

    async run(bot, message, args, db) {

        let l = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${l[0].lang}.js`)

        let xp = args._hoistedOptions[0].value;
        if(!xp) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` !" : "Please indicate a number greater than `0` !"))
        if(isNaN(xp)) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` !" : "Please indicate a number greater than `0` !"))
        if(parseInt(xp) <= 0) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` !" : "Please indicate a number greater than `0` !"))

        let bone = args._hoistedOptions[1].value;
        if(!bone) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` et inférieur à `25` !" : "Please enter a number greater than `0` and less than` 25` !"))
        if(isNaN(bone)) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` et inférieur à `25` !" : "Please enter a number greater than `0` and less than` 25` !"))
        if(parseInt(bone) <= 0 || parseInt(bone) >= 25) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` et inférieur à `25` !" : "Please enter a number greater than `0` and less than` 25` !"))

        let req = await db.selectUser(message.guildId, message.user.id)

        const calculXp = (xp, level) => {

            let xptotal = 0;
            for (let i = 0; i < (parseInt(level) + 1); i++) {
                xptotal = xptotal + (i * 1000)
            }
            xptotal = xptotal + parseInt(xp)
            return xptotal;
        }

        if(req.length < 1) return message.reply(lang.error(l[0].lang === "fr" ? "Vous n'avez pas d'expérience !" : "You have no xp !"))
        if(parseInt(xp) > calculXp(req[0].xp, req[0].level)) return message.reply(lang.error(l[0].lang === "fr" ? "Vous avez misé plus d'expérience que ce que vous avez !" : "You bet more xp than you have !"))

        await message.deferReply()

        let toreveal = []
        let order = [];

        for(let i = 0; i < 25; i++) await toreveal.push("🍽️")
        for(let i = 0; i < parseInt(bone); i++) await order.push("🦴")
        for(let i = 0; i < (25 - parseInt(bone)); i++) await order.push("🍗")
        await order.sort(() => Math.random() - 0.5)

        let Embed = new Discord.EmbedBuilder()
        .setColor(bot.color)
        .setDescription(`${toreveal.slice(0, 5).join(" ")}\n${toreveal.slice(5, 10).join(" ")}\n${toreveal.slice(10, 15).join(" ")}\n${toreveal.slice(15, 20).join(" ")}\n${toreveal.slice(20, 25).join(" ")}`)
        .setTimestamp()
        .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

        const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel(l[0].lang === "fr" ? "Réveler une assiette" : "Reveal a plate")
        .setEmoji("🍽️")
        .setCustomId(`reveal_${message.user.id}`),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Danger)
        .setLabel(l[0].lang === "fr" ? `Récupérer vos ${xp} point${parseInt(xp) > 1 ? "s" : ""} d'expérience` : `Recover your ${xp} xp`)
        .setEmoji("✨")
        .setCustomId(`recover_${message.user.id}`))

        await message.followUp({ content: lang.xp(l[0].lang === "fr" ? `Vous avez misé \`${xp}\` point(s) d'expérience et vous avez mis un total de \`${bone}\` os ! Le but du jeu du poulet et de révéler le plus d'assiettes contenant du poulet sans tomber sur des os ! Que voulez-vous faire ? ${bot.function.emojis.loading}` : `You have bet \`${xp}\` xp point(s) and you put a total of \`${bone}\` bone(s) ! The goal of the chicken game is to reveal the most plates containing chicken without falling on any bones ! What do you want to do ? ${bot.function.emojis.loading}`), embeds: [Embed], components: [btn] })

        let towin = parseInt(xp)
        let multiplicator = parseInt(bone) < 10 ? 0 + (parseInt(bone) / 20) : parseInt(bone) < 20 ? 1 + ((parseInt(bone) - 10) / 20) : 2 + ((parseInt(bone) - 20) / 20)

        const filter = async () => true;
        const collector = (await message.fetchReply()).createMessageComponentCollector({ filter })

        collector.on("collect", async button => {

            if(button.user.id !== message.user.id) return button.reply({ content: lang.error(l[0].lang === "fr" ? "Vous n'êtes pas l'auteur du message !" : "You aren't the author of the message !"), ephemeral: true })

            if(button.customId.includes("reveal")) {

                let filter1 = m => m.author.id === button.user.id;

                try {

                    let question = await button.reply({ content: lang.xp(l[0].lang === "fr" ? "Veuillez indiquer le numéro de l'assiette que vous voulez révéler !" : "Please indicate the number of the plate you want to reveal !"), ephemeral: true })
                    let number = await (await message.channel.awaitMessages({ filter: filter1, max: 1, time: 120000, errors: [`time`] })).first()
                    try { await number.delete() } catch (err) { }
                    if(isNaN(number.content)) return button.editReply({ content: lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre entre \`1\` et \`25\` inclus !" : "Please enter a number between \`1\` and \`25\` inclusive !"), ephemeral: true })
                    if(parseInt(number.content) < 1 || parseInt(number.content) > 25) return button.editReply({ content: lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre entre \`1\` et \`25\` inclus !" : "Please enter a number between \`1\` and \`25\` inclusive !"), ephemeral: true })
                    if(toreveal[parseInt(number.content) - 1] !== "🍽️") return button.editReply({ content: lang.error(l[0].lang === "fr" ? "Vous avez déjà révélé cette assiette !" : "You have already revealed this plate !"), ephemeral: true })

                    let result = order[parseInt(number.content) - 1]
                    toreveal[parseInt(number.content) - 1] = result;
                    towin = towin + Math.floor(towin * multiplicator)

                    let newEmbed = new Discord.EmbedBuilder()
                    .setColor(bot.color)
                    .setDescription(`${toreveal.slice(0, 5).join(" ")}\n${toreveal.slice(5, 10).join(" ")}\n${toreveal.slice(10, 15).join(" ")}\n${toreveal.slice(15, 20).join(" ")}\n${toreveal.slice(20, 25).join(" ")}`)
                    .setTimestamp()
                    .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                    const newbtn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setLabel(l[0].lang === "fr" ? "Réveler une assiette" : "Reveal a plate")
                    .setEmoji("🍽️")
                    .setCustomId(`reveal_${message.user.id}`),
                    new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setLabel(l[0].lang === "fr" ? `Récupérer vos ${towin} point(s) d'expérience` : `Recover your ${towin} xp point(s)`)
                    .setEmoji("✨")
                    .setCustomId(`recover_${message.user.id}`))

                    if(result === "🍗") {

                        await message.editReply({ content: lang.xp(l[0].lang === "fr" ? `Bravo ! Vous avez révélé une assiette qui contenait \`🍗\` ! Vous ajoutez \`${Math.floor(towin * multiplicator)}\` point(s) d'expérience à vos gains ! Que voulez-vous faire ? ${bot.function.emojis.loading}` : `Well done ! You revealed a plate that contained \`🍗\` ! You add \`${Math.floor(towin * multiplicator)}\` xp point(s) to your earnings ! What do you want to do ? ${bot.function.emojis.loading}`), embeds: [newEmbed], components: [newbtn] })
                    }

                    if(result === "🦴") {

                        await collector.stop()
                        db.update("user", "xp", `${parseInt(req[0].xp) - parseInt(xp)}`, "ID", `${message.guildId} ${message.user.id}`)
                        
                        await message.editReply({ content: lang.xp(l[0].lang === "fr" ? `Dommage ! Vous avez révélé une assiette contenant \`🦴\` ! Vous avez perdu, \`${xp}\` point(s) d'expérience vous ont été retirés ! ${bot.function.emojis.cancel}` : `Pity ! You revealed a plate containing \`🦴\` ! You have lost, \`${xp}\` xp point(s) have been removed ! ${bot.function.emojis.cancel}`), embeds: [newEmbed], components: [] })
                    }

                } catch (err) {

                    return button.editReply({ content: lang.error(l[0].lang === "fr" ? "Vous avez mis trop de temps pour répondre à la question !" : "You took too long to answer the question !"), ephemeral: true })
                }
            }

            if(button.customId.includes("recover")) {

                await collector.stop()
                db.update("user", "xp", `${parseInt(req[0].xp) + towin}`, "ID", `${message.guildId} ${message.user.id}`)

                let newEmbed = new Discord.EmbedBuilder()
                .setColor(bot.color)
                .setDescription(`${toreveal.slice(0, 5).join(" ")}\n${toreveal.slice(5, 10).join(" ")}\n${toreveal.slice(10, 15).join(" ")}\n${toreveal.slice(15, 20).join(" ")}\n${toreveal.slice(20, 25).join(" ")}`)
                .setTimestamp()
                .setFooter({ text: `${bot.user.username} © 2022`, iconURL: bot.user.displayAvatarURL({ dynamic: true }) })

                await message.editReply({ content: lang.xp(l[0].lang === "fr" ? `Bravo ! Vous avez gagné, \`${towin}\` point(s) d'expérience vous ont été ajoutés ! ${bot.function.emojis.complete}` : `Well done ! You have won, \`${towin}\` xp point(s) have been added to you ! ${bot.function.emojis.complete}`), embeds: [newEmbed], components: [] })
            }
        })
    }
})
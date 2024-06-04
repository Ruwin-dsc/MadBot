const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "blackjack",
    description: ["Permet de miser une quantité d'expérience sur le jeu du blackjack", "Allow to bet a xp's quantity on the blackjack game"],
    utilisation: ["[mise]", "[bet]"],
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
        }
    ],

    async run(bot, message, args, db) {

        let l = await db.selectGuild(message.guildId)
        const lang = require(`../Fonctions/${l[0].lang}.js`)

        let xp = args._hoistedOptions[0].value;
        if(!xp) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` !" : "Please indicate a number greater than `0` !"))
        if(isNaN(xp)) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` !" : "Please indicate a number greater than `0` !"))
        if(parseInt(xp) <= 0) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` !" : "Please indicate a number greater than `0` !"))

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

        let signes = ["♦️", "♥️", "♣️", "♠️"]
        let cartes = ["as", "roi", "reine", "valet", "10", "9", "8", "7", "6", "5", "4", "3", "2"]
        let signe = signes[Math.floor(Math.random() * signes.length)]
        let carte = cartes[Math.floor(Math.random() * cartes.length)]

        const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setEmoji("🃏")
        .setCustomId(`draw_${message.user.id}`)
        .setLabel(l[0].lang === "fr" ? "Piocher une nouvelle carte" : "Draw a new card"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Danger)
        .setEmoji("🖐️")
        .setCustomId(`bet_${message.user.id}`)
        .setLabel(l[0].lang === "fr" ? "Révéler votre main" : "Reveal your hand"))

        let mount = carte === "roi" ? 10 : carte === "reine" ? 10 : carte === "valet" ? 10 : carte === "as" ? 11 : parseInt(carte)
        let ordimount = Math.floor(Math.random() * 11) + 1;

        await message.reply({ content: lang.xp(l[0].lang === "fr" ? `Vous avez misé \`${xp}\` point(s) d'expérience, si vous gagnez vous doublez votre mise, sinon vous la perdez ! Le but du blackjack est de terminer votre main le plus proche possible de \`21\` par rapport à l'ordinateur. Vous venez de piocher un(e) \`${carte}${signe}\` ! Votre main s'élève à \`${mount}\` ! Que voulez-vous faire ? ${bot.function.emojis.loading}` : `You have bet \`${xp}\` xp point(s), ifyou win you double your bet, otherwise you lose it ! The object of blackjack is to finish your hand as close as possible to \`21\` from the computer. You've just drawn a \`${carte === "roi" ? "king" : carte === "reine" ? "queen" : carte === "as" ? "ace" : carte === "valet" ? "jack" : carte}${signe}\` ! Your hand is \`${mount}\` ! What do you want to do ? ${bot.function.emojis.loading}`), components: [btn] })

        const filter = async () => true;
        const collector = (await message.fetchReply()).createMessageComponentCollector({ filter })

        collector.on("collect", async button => {

            if(button.user.id !== message.user.id) return button.reply({ content: lang.error(l[0].lang === "fr" ? "Vous n'êtes pas l'auteur du message !" : "You aren't the author of the message !"), ephemeral: true })

            if(button.customId.includes("draw")) {

                let newsigne = signes[Math.floor(Math.random() * signes.length)]
                let newcarte = cartes[Math.floor(Math.random() * cartes.length)]

                mount += (newcarte === "roi" ? 10 : newcarte === "reine" ? 10 : newcarte === "valet" ? 10 : newcarte === "as" ? 11 : parseInt(newcarte))
                ordimount += Math.floor(Math.random() * 11) + 1;

                if(mount > 21) {

                    await button.deferUpdate()
                    message.editReply({content: lang.xp(l[0].lang === "fr" ? `Dommage ${button.user}, vous avez pioché un \`${newcarte}${newsigne}\`. Votre main s'élève à \`${mount}\`, elle est au-dessus de \`21\` ! Vous avez perdu, \`${xp}\` point(s) d'expérience vous ont été retiré(s) ! ${bot.function.emojis.cancel}` : `Pity ${button.user},you drew a \`${newcarte === "roi" ? "king" : newcarte === "reine" ? "queen" : newcarte === "as" ? "ace" : newcarte === "valet" ? "jack" : newcarte}${newsigne}\`. Your hand is \`${mount}\`, it is above \`21\` ! You have lost, \`${xp}\` experience point(s) have been taken away from you ! ${bot.function.emojis.cancel}`), components: []})
                    await collector.stop()
                    db.update("user", "xp", `${parseInt(req[0].xp) - parseInt(xp)}`, "ID", `${message.guildId} ${message.user.id}`)

                } else if(ordimount > 21) {

                    await button.deferUpdate()
                    message.editReply({content: lang.xp(l[0].lang === "fr" ? `Félicitations ${button.user}, l'ordinateur a une main de \`${ordimount}\`, elle plus élevée que \`21\` ! Vous avez gagné, vous remportez \`${xp}\` point(s) d'expérience ! ${bot.function.emojis.complete}` : `Congrulation ${button.user}, the computer has a hand of \`${ordimount}\`, which is higher than \`21\` ! You won \`${xp}\` xp point(s) ! ${bot.function.emojis.complete}`), components: []})
                    await collector.stop()
                    db.update("user", "xp", `${parseInt(req[0].xp) + parseInt(xp)}`, "ID", `${message.guildId} ${message.user.id}`)

                } else {

                    if(ordimount >= mount) {

                        let chance = Math.floor(Math.random() * 2) + 1;

                        if(chance === 2) {

                            if(mount === ordimount) {

                                await button.deferUpdate()
                                message.editReply({content: lang.xp(l[0].lang === "fr" ? `L'ordinateur révèle ses cartes ! Egalité ${button.user}, votre main s'élève à \`${mount}\` et celle de l'ordinateur a \`${ordimount}\`. Vous ne remportez pas de points d'expérience, mais vous n'en perdez pas ! ${bot.function.emojis.complete}` : `The computer reveals its cards ! Equals ${button.user}, your hand is \`${mount}\` and the computer's is \`${ordimount}\`. You don't win xp points, but you don't lose any ! ${bot.function.emojis.complete}`), components: []})
                                await collector.stop()

                            } else if(mount > ordimount) {

                                await button.deferUpdate()
                                message.editReply({content: lang.xp(l[0].lang === "fr" ? `L'ordinateur révèle ses cartes ! Félicitations ${button.user}, votre main s'élève à \`${mount}\` et celle de l'ordinateur a \`${ordimount}\`. Vous êtes le plus proche de \`21\` ! Vous avez gagné, vous remportez \`${xp}\` point(s) d'expérience ! ${bot.function.emojis.complete}` : `The computer reveals its cards ! Congrulation ${button.user}, your hand is \`${mount}\` and the computer's hand is \`${ordimount}\`. You are the closest to \`21\` ! You won \`${xp}\` xp point(s) ! ${bot.function.emojis.complete}`), components: []})
                                await collector.stop()
                                db.update("user", "xp", `${parseInt(req[0].xp) + parseInt(xp)}`, "ID", `${message.guildId} ${message.user.id}`)

                            } else {

                                await button.deferUpdate()
                                message.editReply({content: lang.xp(l[0].lang === "fr" ? `L'ordinateur révèle ses cartes ! Dommage ${button.user}, votre main s'élève à \`${mount}\` et celle de l'ordinateur a \`${ordimount}\`. L'ordinateur est le plus proche de \`21\` ! Vous avez perdu, \`${xp}\` point(s) d'expérience vous ont été retiré(s) ! ${bot.function.emojis.cancel}` : `The computer reveals its cards ! Pity ${button.user}, your hand is \`${mount}\` and the computer's hand is \`${ordimount}\`. The computer is closest to \`21\` ! You have lost, \`${xp}\` xp point(s) have been taken away from you ! ${bot.function.emojis.cancel}`), components: []})
                                await collector.stop()
                                db.update("user", "xp", `${parseInt(req[0].xp) - parseInt(xp)}`, "ID", `${message.guildId} ${message.user.id}`)
                            }

                        } else {

                            await button.reply({ content: lang.xp(l[0].lang === "fr" ? `Vous avez pioché une carte avec succès ! ${bot.function.emojis.complete}` : `You have drawn a card with success ! ${bot.function.emojis.complete}`), ephemeral: true })
                            await message.editReply(lang.xp(l[0].lang === "fr" ? `Vous venez de piocher un(e) \`${newcarte}${newsigne}\` ! Votre main s'élève à \`${mount}\` ! Que voulez-vous faire ? ${bot.function.emojis.loading}` : `You've just drawn a \`${newcarte === "roi" ? "king" : newcarte === "reine" ? "queen" : newcarte === "as" ? "ace" : newcarte === "valet" ? "jack" : newcarte}${newsigne}\` ! Your hand is \`${mount}\` ! What do you want to do ? ${bot.function.emojis.loading}`))
                        }

                    } else {

                        await button.reply({content: lang.xp(l[0].lang === "fr" ? `Vous avez pioché une carte avec succès ! ${bot.function.emojis.complete}` : `You have drawn a card with success ! ${bot.function.emojis.complete}`), ephemeral: true })
                        await message.editReply(lang.xp(l[0].lang === "fr" ? `Vous venez de piocher un(e) \`${newcarte}${newsigne}\` ! Votre main s'élève à \`${mount}\` ! Que voulez-vous faire ? ${bot.function.emojis.loading}` : `You've just drawn a \`${newcarte === "roi" ? "king" : newcarte === "reine" ? "queen" : newcarte === "as" ? "ace" : newcarte === "valet" ? "jack" : newcarte}${newsigne}\` ! Your hand is \`${mount}\` ! What do you want to do ? ${bot.function.emojis.loading}`))

                    }
                }
            }

            if(button.customId.includes("bet")) {

                if(mount === ordimount) {

                    await button.deferUpdate()
                    message.editReply({content: lang.xp(l[0].lang === "fr" ? `Egalité ${button.user}, votre main s'élève à \`${mount}\` et celle de l'ordinateur à \`${ordimount}\`. Vous ne remportez pas de points d'expérience, mais vous n'en perdez pas ! ${bot.function.emojis.complete}` : `Equals ${button.user}, your hand is \`${mount}\` and the computer's is \`${ordimount}\`. You don't win xp points, but you don't lose any ! ${bot.function.emojis.complete}`), components: []})
                    await collector.stop()

                } else if(mount > ordimount) {

                    await button.deferUpdate()
                    message.editReply({content: lang.xp(l[0].lang === "fr" ? `Félicitations ${button.user}, votre main s'élève à \`${mount}\` et celle de l'ordinateur à \`${ordimount}\`. Vous êtes le plus proche de \`21\` ! Vous avez gagné, vous remportez \`${xp}\` point(s) d'expérience ! ${bot.function.emojis.complete}` : `Congrulation ${button.user}, your hand is \`${mount}\` and the computer's hand is \`${ordimount}\`. You are the closest to \`21\` ! You won \`${xp}\` xp point(s) ! ${bot.function.emojis.complete}`), components: []})
                    await collector.stop()
                    db.update("user", "xp", `${parseInt(req[0].xp) + parseInt(xp)}`, "ID", `${message.guildId} ${message.user.id}`)

                } else {

                    await button.deferUpdate()
                    message.editReply({content: lang.xp(l[0].lang === "fr" ? `Dommage ${button.user}, votre main s'élève à \`${mount}\` et celle de l'ordinateur à \`${ordimount}\`. L'ordinateur est le plus proche de \`21\` ! Vous avez perdu, \`${xp}\` point(s) d'expérience vous ont été retiré(s) ! ${bot.function.emojis.cancel}` : `Pity ${button.user}, your hand is \`${mount}\` and the computer's hand is \`${ordimount}\`. The computer is closest to \`21\` ! You have lost, \`${xp}\` xp point(s) have been taken away from you ! ${bot.function.emojis.cancel}`), components: []})
                    await collector.stop()
                    db.update("user", "xp", `${parseInt(req[0].xp) - parseInt(xp)}`, "ID", `${message.guildId} ${message.user.id}`)
                }
            }
        })
    }
})
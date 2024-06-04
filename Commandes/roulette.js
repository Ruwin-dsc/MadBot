const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "roulette",
    description: ["Permet de miser une quantité d'expérience sur la roulette", "Allow to bet a xp's quantity on the roulette"],
    utilisation: ["[mise]", "[bet]"],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks, Discord.PermissionFlagsBits.ManageMessages],
    category: ["Expérience", "Experience"],
    cooldown: 300,
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

        let bet = args._hoistedOptions[0].value;
        if(!bet) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` !" : "Please indicate a number greater than `0` !"))
        if(isNaN(bet)) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` !" : "Please indicate a number greater than `0` !"))
        if(parseInt(bet) <= 0) return message.reply(lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre supérieur à `0` !" : "Please indicate a number greater than `0` !"))

        let req = await db.selectUser(message.guildId, message.user.id)

        const calculXp = (xp, level) => {

            let xptotal = 0
            for (let i = 0; i < (parseInt(level) + 1); i++) xptotal = xptotal + (i * 1000)
            xptotal = xptotal + parseInt(xp)
            return xptotal;
        }

        if(req.length < 1) return message.reply(lang.error(l[0].lang === "fr" ? "Vous n'avez pas d'expérience !" : "You have no xp !"))
        if(parseInt(bet) > calculXp(req[0].xp, req[0].level)) return message.reply(lang.error(l[0].lang === "fr" ? "Vous avez misé plus d'expérience que ce que vous avez !" : "You bet more xp than you have !"))

        const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel(l[0].lang === "fr" ? "Parier sur la couleur rouge" : "Bet on the red color")
        .setCustomId(`red_${message.user.id}`)
        .setEmoji("🔴"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel(l[0].lang === "fr" ? "Parier sur la couleur noire" : "Bet on the black color")
        .setCustomId(`black_${message.user.id}`)
        .setEmoji("⚫"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel(l[0].lang === "fr" ? "Parier sur un chiffre impair" : "Bet on the odd number")
        .setCustomId(`impair_${message.user.id}`)
        .setEmoji("1️⃣"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel(l[0].lang === "fr" ? "Parier sur un chiffre pair" : "Bet on the even number")
        .setCustomId(`pair_${message.user.id}`)
        .setEmoji("2️⃣"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setLabel(l[0].lang === "fr" ? "Parier sur un chiffre choisi" : "Bet on the chosen number")
        .setCustomId(`number_${message.user.id}`)
        .setEmoji("0️⃣"))

        await message.reply({ content: lang.xp(l[0].lang === "fr" ? `Vous avez misé \`${bet}\` point(s) d'exéprience, si vous gagnez, vous pouvez doubler ou tripler votre mise selon votre moyen de paris, sinon vous la perdez ! Le but de la roulette est de tomber sur la bonne couleur ou le bon chiffre. Veuillez sélectionner un moyen de paris ! ${bot.function.emojis.loading}` : `You have bet \`${bet}\` xp point(s), ifyou win, you can double or triple your bet depending on your betting average, otherwise you lose it ! The object of roulette is to land on the right color or the right number. Please select a betting method ! ${bot.function.emojis.loading}`), components: [btn] })

        try {

            let filter = b => b.user.id === message.user.id
            let button = await (await message.fetchReply()).awaitMessageComponent({ filter, max: 1, time: 30000, errors: [`time`] })
            let choice = button.customId;

            let number = Math.floor(Math.random() * 37);
            let color = number === 0 ? "green" : (number === 32 || number === 19 || number === 21 || number === 25 || number === 34 || number === 27 || number === 36 || number === 30 || number === 23 || number === 5 || number === 16 || number === 1 || number === 14 || number === 9 || number === 18 || number === 7 || number === 12 || number === 3) ? "red" : "black";

            if(choice.startsWith("number")) {

                try {

                    let filter1 = m => m.author.id === message.user.id
                    let question = await button.reply({ content: lang.xp(l[0].lang === "fr" ? "Quel est le nombre que vous voulez choisir ?" : "What number do you want to choose ?"), ephemeral: true })
                    let reponse = (await message.channel.awaitMessages({ filter: filter1, max: 1, time: 30000, errors: [`time`] })).first()
                    if(isNaN(reponse.content)) return button.editReply({ content: lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre entre à `0` et `37` inclus !" : "Please indicate a number between `0` and `37` inclusive !"), ephemeral: true })
                    if(parseInt(reponse.content) < 0 || parseInt(reponse.content) > 37) return button.editReply({ content: lang.error(l[0].lang === "fr" ? "Veuillez indiquer un nombre entre à `0` et `37` inclus !" : "Please indicate a number between `0` and `37` inclusive !"), ephemeral: true })
                    try { await reponse.delete() } catch (err) { }

                    if(number === parseInt(reponse.content)) {

                        await message.editReply({ content: lang.xp(l[0].lang === "fr" ? `Félicitations ${button.user}, le nombre était bien \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\` ! Vous avez gagné, vous remportez \`${parseInt(bet) * 3}\` point(s) d'expérience ! ${bot.function.emojis.complete}` : `Congratulations ${button.user}, the number was correct \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\` ! You won, you win \`${parseInt(bet) * 3}\` xp point(s) ! ${bot.function.emojis.complete}`), components: [] })
                        await db.update("user", "xp", `${parseInt(req[0].xp) + (parseInt(bet) * 3)}`, "ID", `${message.guildId} ${message.user.id}`)

                    } else {

                        await message.editReply({ content: lang.xp(l[0].lang === "fr" ? `Dommage ${button.user}, le nombre était \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\` ! Vous avez perdu, \`${parseInt(bet)}\` point(s) d'expérience vous ont été retirés ! ${bot.function.emojis.cancel}` : `Pity ${button.user}, the number was \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\`! You have lost, \`${parseInt(bet)}\` xp point(s) have been removed ! ${bot.function.emojis.cancel}`), components: [] })
                        await db.update("user", "xp", `${parseInt(req[0].xp) - parseInt(bet)}`, "ID", `${message.guildId} ${message.user.id}`)
                    }

                } catch (err) {

                    return button.editReply(lang.error(l[0].lang === "fr" ? "Vous avez mis trop de temps pour répondre à la question !" : "You took too long to answer the question !"))
                }

            } else if(choice.startsWith("red") || choice.startsWith("black")) {

                if(color === choice.split("_")[0]) {

                    await message.editReply({ content: lang.xp(l[0].lang === "fr" ? `Félicitations ${button.user}, le nombre était \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\`, vous avez choisi la bonne couleur ! Vous avez gagné, vous remportez \`${parseInt(bet)}\` point(s) d'expérience ! ${bot.function.emojis.complete}` : `Congratulations ${button.user}, the number was \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\`, you choosen the good color ! You won, you win \`${parseInt(bet)}\` xp point(s) ! ${bot.function.emojis.complete}`), components: [] })
                    await db.update("user", "xp", `${parseInt(req[0].xp) + parseInt(bet)}`, "ID", `${message.guildId} ${message.user.id}`)

                } else {

                    await message.editReply({ content: lang.xp(l[0].lang === "fr" ? `Dommage ${button.user}, le nombre était \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\` ! Vous avez perdu, \`${parseInt(bet)}\` point(s) d'expérience vous ont été retirés ! ${bot.function.emojis.cancel}` : `Pity ${button.user}, the number was \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\`! You have lost, \`${parseInt(bet)}\` xp point(s) have been removed ! ${bot.function.emojis.cancel}`), components: [] })
                    await db.update("user", "xp", `${parseInt(req[0].xp) - parseInt(bet)}`, "ID", `${message.guildId} ${message.user.id}`)
                }

            } else {

                let pairorimpair = (`${number}`).endsWith(0) || (`${number}`).endsWith(2) || (`${number}`).endsWith(4) || (`${number}`).endsWith(6) || (`${number}`).endsWith(8) ? "pair" : "impair";

                if(pairorimpair === choice.split("_")[0]) {

                    await message.editReply({ content: lang.xp(l[0].lang === "fr" ? `Félicitations ${button.user}, le nombre était \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\`, il était bien ${choice.split("_")[0]} ! Vous avez gagné, vous remportez \`${parseInt(bet)}\` point(s) d'expérience ! ${bot.function.emojis.complete}` : `Congratulations ${button.user}, the number was \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\`, it was good \`${choice.split("_")[0] === "pair" ? "even" : "odd"}\` ! You won, you win \`${parseInt(bet)}\` xp point(s) ! ${bot.function.emojis.complete}`), components: [] })
                    await db.update("user", "xp", `${parseInt(req[0].xp) + parseInt(bet)}`, "ID", `${message.guildId} ${message.user.id}`)

                } else {

                    await message.editReply({ content: lang.xp(l[0].lang === "fr" ? `Dommage ${button.user}, le nombre était \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\` ! Vous avez perdu, \`${parseInt(bet)}\` point(s) d'expérience vous ont été retirés ! ${bot.function.emojis.cancel}` : `Pity ${button.user}, the number was \`${number}${color === "black" ? "⚫" : color === "red" ? "🔴" : "🟢"}\`! You have lost, \`${parseInt(bet)}\` xp point(s) have been removed ! ${bot.function.emojis.cancel}`), components: [] })
                    await db.update("user", "xp", `${parseInt(req[0].xp) - parseInt(bet)}`, "ID", `${message.guildId} ${message.user.id}`)
                }
            }

        } catch (err) {

            return message.editReply({ content: lang.error(l[0].lang === "fr" ? "Vous avez mis trop de temps pour répondre à la question !" : "You took too long to answer the question !"), components: [] })
        }
    }
})
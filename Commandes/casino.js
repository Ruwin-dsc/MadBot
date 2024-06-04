const Discord = require("discord.js")
const Command = require("../Structure/Command")

module.exports = new Command({

    name: "casino",
    description: ["Permet de miser une quantité d'expérience pour en gagner le double", "Allow to bet a xp's quantity to win the double"],
    utilisation: ["[mise]", "[bet]"],
    permission: "Aucune",
    botpermission: [Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.UseApplicationCommands, Discord.PermissionFlagsBits.UseExternalEmojis, Discord.PermissionFlagsBits.EmbedLinks],
    category: ["Expérience", "Experience"],
    cooldown: 20,
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

        let xp = args.getNumber("bet")
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

        const btn = new Discord.ActionRowBuilder().addComponents(new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setCustomId(`banana_${message.user.id}`)
        .setEmoji("🍌"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setCustomId(`strawberry_${message.user.id}`)
        .setEmoji("🍓"),
        new Discord.ButtonBuilder()
        .setStyle(Discord.ButtonStyle.Primary)
        .setCustomId(`grapes_${message.user.id}`)
        .setEmoji("🍇"))

        let msg = await message.reply({ content: lang.xp(l[0].lang === "fr" ? `Veuillez cliquer sur un bouton, si vous obtenez le bon fruit, vous doublez votre mise, sinon vous la perdez ! ${bot.function.emojis.loading}` : `Please click a button, ifyou get the right fruit you double your bet, otherwise you lose it ! ${bot.function.emojis.loading}`), components: [btn] })

        const filter = async () => true;
        const collector = (await message.fetchReply()).createMessageComponentCollector({ filter })

        collector.on("collect", async button => {

            if(message.user.id !== button.user.id) return button.reply({ content: lang.error(l[0].lang === "fr" ? "Vous n'êtes pas l'auteur du message !" : "You aren't the author of the message !"), ephemeral: true })

            let bet;
            if(button.customId.includes("grapes")) bet = "🍇";
            if(button.customId.includes("strawberry")) bet = "🍓";
            if(button.customId.includes("banana")) bet = "🍌";

            let fruits = ["🍌", "🍓", "🍇"]
            let result = fruits[Math.floor(Math.random() * fruits.length)]

            if(bet === result) {

                await button.deferUpdate()
                await message.editReply({content: lang.xp(l[0].lang === "fr" ? `Félicitations ${button.user}, le fruit était bien \`${result}\` ! Vous avez gagné, vous remportez \`${xp}\` point(s) d'expérience ! ${bot.function.emojis.complete}` : `Congratulation ${button.user}, the fruit was indeed \`${result}\` ! You won \`${xp}\` xp point(s) ! ${bot.function.emojis.complete}`), components: []})
                db.update("user", "xp", `${parseInt(req[0].xp) + parseInt(xp)}`, "ID", `${message.guildId} ${message.user.id}`)
                await collector.stop()

            } else {

                await button.deferUpdate()
                await message.editReply({content: lang.xp(l[0].lang === "fr" ? `Dommage ${button.user}, le fruit était \`${result}\` ! Vous avez perdu, \`${xp}\` point(s) d'expérience vous ont été retiré(s) ! ${bot.function.emojis.cancel}` : `Pity ${button.user}, the fruit was \`${result}\` ! You lost, \`${xp}\` xp point(s) you have been taken away ! ${bot.function.emojis.cancel}`), components: []})
                db.update("user", "xp", `${parseInt(req[0].xp) - parseInt(xp)}`, "ID", `${message.guildId} ${message.user.id}`)
                await collector.stop()
            }
        })
    }
})
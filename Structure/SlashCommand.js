const { REST } = require("@discordjs/rest")
const { Routes } = require("discord.js")
const Discord = require("discord.js")
const { token } = require("../config")

module.exports = async (bot) => {

    let commands = []

    bot.commands.forEach(command => {

        let slashcommand;

        if(command.options && command.options.length >= 1) {

            slashcommand = new Discord.SlashCommandBuilder()
            .setName(command.name)
            .setNameLocalizations({"fr": command.name})
            .setDescription(command.description[1])
            .setDescriptionLocalizations({"fr": command.description[0]})
            .setDMPermission(false)
            .setDefaultMemberPermissions(command.permission === "Aucune" ? null : command.permission === "Développeur" ? Discord.PermissionFlagsBits.Administrator : command.permission)

            if(command.options && command.options.length >= 1) {
                for (let i = 0; i < command.options.length; i++) {
                    if(command.options[i].type === "string") slashcommand[`add${command.options[i].type.slice(0, 1).toUpperCase() + command.options[i].type.slice(1, command.options[i].type.length)}Option`](option => option.setName(command.options[i].name[1]).setNameLocalizations({"fr": command.options[i].name[0]}).setDescription(command.options[i].description[1]).setDescriptionLocalizations({"fr": command.options[i].description[0]}).setAutocomplete(command.options[i].autocomplete).setRequired(command.options[i].required))
                    else slashcommand[`add${command.options[i].type.slice(0, 1).toUpperCase() + command.options[i].type.slice(1, command.options[i].type.length)}Option`](option => option.setName(command.options[i].name[1]).setNameLocalizations({"fr": command.options[i].name[0]}).setDescription(command.options[i].description[1]).setDescriptionLocalizations({"fr": command.options[i].description[0]}).setRequired(command.options[i].required))
                }
            }

            commands.push(slashcommand)

        } else {

            slashcommand = new Discord.SlashCommandBuilder()
            .setName(command.name)
            .setNameLocalizations({"fr": command.name})
            .setDescription(command.description[1])
            .setDescriptionLocalizations({"fr": command.description[0]})
            .setDMPermission(false)
            .setDefaultMemberPermissions(command.permission === "Aucune" ? null : command.permission)

            commands.push(slashcommand)
        }
    })

    const rest = new REST({ version: '10' }).setToken(token);
    try {await rest.put(Routes.applicationCommands(bot.user.id), { body: commands })} catch(err) {}

    console.log("Les slashs commandes ont été créées avec succès !")
}
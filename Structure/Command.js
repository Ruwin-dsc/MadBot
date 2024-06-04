/** @format */

const Discord = require("discord.js");
const Database = require("./Database")
const Client = require("./Client");

/**
 * @param {Client} bot
 * @param {Discord.CommandInteraction} message
 * @param {Discord.CommandInteractionOptionResolver} args
 * @param {Database} db
*/

function RunFunction(bot, message, args, db) {}

class Command {

    /**
     * @typedef {{type: string, name: string, description: string, required: boolean, autocomplete: boolean}} SlashCommandOptions
     * @typedef {{name: string, description: string[], utilisation: string[], alias: string[], permission: bigint, botpermission: bigint[], category: string[], cooldown: number, options: SlashCommandOptions[], run: RunFunction}} CommandOptions
     * @param {CommandOptions} options 
    */
    
    constructor(options) {

        this.name = options.name;
        this.description = options.description;
        this.utilisation = options.utilisation;
        this.alias = options.alias;
        this.permission = options.permission;
        this.botpermission = options.botpermission;
        this.category = options.category;
        this.cooldown = options.cooldown;
        this.options = options.options;
        this.run = options.run;
    }
}

module.exports = Command;
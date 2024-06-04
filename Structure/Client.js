const Discord = require("discord.js");
const fs = require("fs")
const intents = new Discord.IntentsBitField(3276799)
const Command = require("./Command");
const Database = require("./Database");
const Event = require("./Event");

class Client extends Discord.Client {

    constructor() {

        super({ intents, partials: [Discord.Partials.Channel, Discord.Partials.GuildMember, Discord.Partials.GuildScheduledEvent, Discord.Partials.Message, Discord.Partials.Reaction, Discord.Partials.ThreadMember, Discord.Partials.User] });

        /**
         * @type {Discord.Collection<string, Command>}
        */

        this.commands = new Discord.Collection();
        this.cooldown = new Discord.Collection();
        this.db = new Database();
        this.color = "#f25858";
        this.function = {
            emojis: require("../Fonctions/emojis"),
            fr: require("../Fonctions/fr"),
            en: require("../Fonctions/en"),
            createID: require("../Fonctions/createID"),
            generateCaptcha: require("../Fonctions/generateCaptcha")
        }
    }

    async start(token) {
        
        fs.readdirSync("./Commandes").filter(file => file.endsWith(".js")).forEach(async f => {
      
            /**
             * @type {Command} 
            */

            let props = require(`../Commandes/${f}`);
            if(!props.name || !props.description || !props.utilisation || !props.permission || !props.botpermission || !props.category || !props.cooldown) return console.log(`La commande ${f.replace(".js", "")} n'a pas été chargé car il manque des éléments d'informations !`)
            if(props.options && props.options.length > 0) {
                for(let i = 0; i < props.options.length; i++) {
                    if(!props.options[i].name && !props.options[i].description && !props.options[i].required && !props.options[i].type && !props.options[i].autocomplete) return console.log(`La commande ${f.replace(".js", "")} n'a pas été chargé car il manque des éléments d'informations dans une option !`)
                    if(props.options[i].type !== "user" && props.options[i].type !== "channel" && props.options[i].type !== "role" && props.options[i].type !== "number" && props.options[i].type !== "integrer" && props.options[i].type !== "string") return console.log(`La commande ${f.replace(".js", "")} n'a pas été chargé car le type d'une option est invalide !`)
                }
            }
            console.log(`${f} commande chargée avec succès !`);
            this.commands.set(props.name, props)
        })

        fs.readdirSync("./Events/").forEach(dirs => {
    
            fs.readdirSync(`./Events/${dirs}/`).filter(files => files.endsWith(".js")).forEach(async evt => {

                /**
                 * @type {Event}
                */

                const event = require(`../Events/${dirs}/${evt}`);
                console.log(`${event.event}.js événement chargé avec succès !`)
                this.on(event.event, event.run.bind(null, this));
            })
        });

        await this.db.connect()
        await this.login(token)
    }
}

module.exports = Client;
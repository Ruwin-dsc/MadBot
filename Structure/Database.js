const mysql = require("mysql")
const config = require('../config.js')
class Database {

    constructor() {
        this.db = new mysql.createConnection({
            host: config.BDD.host,
            user: config.BDD.user,
            password: config.BDD.password,
            database: config.BDD.database,
            port: config.BDD.port
        })
    }

    connect() {

        this.db.connect(async function(err) {

            if(err) throw err;
            console.log("La base de données a été connectée avec succès !")
        })

        return this.db;
    }
    
    /**
     * @param {string} table 
     * @param {string[]} keyvalues 
     * @param {string[]} values 
    */

    insert(table, keyvalues, values) {

        let sql = `INSERT INTO ${table} (${keyvalues.join(", ")}) VALUES (${values.map(value => `'${value}'`).join(", ")})`
        this.db.query(sql, function(err) {
            if(err) throw err;
        })
    }

    /**
     * @param {string} table 
     * @param {string} key 
     * @param {string} keyID 
    */

    delete(table, key, keyID) {

        this.db.query(`DELETE FROM ${table} WHERE ${key} = '${keyID}'`)
    }

    /**
     * @param {string} table 
     * @param {string} keyvalue 
     * @param {string} value 
     * @param {string} key 
     * @param {string} keyID 
    */

    update(table, keyvalue, value, key, keyID) {

        this.db.query(`UPDATE ${table} SET ${keyvalue} = '${value}' WHERE ${key} = '${keyID}'`)
    }

    /**
     * @param {string} table 
     * @param {string} key 
     * @param {string} keyID 
     * @returns 
    */

    select(table, key, keyID) {

        return new Promise(async (req) => {
            this.db.query(`SELECT * FROM ${table}${key && keyID ? ` WHERE ${key} = '${keyID}'`: ""}`, async (err, res) => {
                req(res)
            })
        })
    }

    /**
     * @param {string} guildID 
     * @typedef {{guildID: string, prefix: string, lang: string, experience: string, channelexperience: string, moderation: string, channellogs: string, captcha: string, captcharole: string}[]} GuildData
     * @returns {GuildData}
    */

    selectGuild(guildID) {

        return new Promise(async (req) => {
            this.db.query(`SELECT * FROM serveur WHERE guildID = '${guildID}'`, async (err, res) => {
                req(res)
            })
        })
    }

    /**
     * @param {string} guildID 
     * @param {string} user
     * @typedef {{ID: string, guildID: string, userID: string, xp: string, level: string}[]} UserData
     * @returns {UserData}
    */

    selectUser(guildID, userID) {
        return new Promise(async (req) => {
            this.db.query(`SELECT * FROM user WHERE ID = '${guildID} ${userID}'`, async (err, res) => {
                req(res)
            })
        })
    }

    /**
     * @param {string} guildID 
     * @typedef {{guildID: string, enable: string, disable: string}[]} GuildLogsData
     * @returns {GuildLogsData}
    */

    selectLogs(guildID) {
        return new Promise(async (req) => {
            this.db.query(`SELECT * FROM logs WHERE guildID = '${guildID}'`, async (err, res) => {
                req(res)
            })
        })
    }
}

module.exports = Database;
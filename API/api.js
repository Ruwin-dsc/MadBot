const express = require("express")
const app = express()

module.exports = async(bot) => {

    app.get("/user/:id", async (req, res) => {

        try {
            
            let user = await bot.users.fetch(req.params.id)
            res.status(500).json(user)

        } catch (err) {

            res.status(500).json({"error": "No body found"})
        }
    })

    app.get("/server/:id", async (req, res) => {

        try {
                
            let guild = await bot.guilds.fetch(req.params.id)
            res.status(500).json(guild)
    
        } catch (err) {
    
            res.status(500).json({"error": "No guild found"})
        }
    })

    app.get("/", async (req, res) => {

        res.send("MadBot API")
    })
    
    app.listen(3000, async() => console.log("API démarrée avec succès !"))
}
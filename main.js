const Client = require("./Structure/Client")
const bot = new Client();
const config = require('./config.js')

bot.start(config.token);

process.on("unhandledRejection", async (err) => {

    await console.log(err)

    try {
        bot.channels.cache.get("889898380669624360").send(`\`\`\`js\n${err}\`\`\``)
    } catch (err) {}
})
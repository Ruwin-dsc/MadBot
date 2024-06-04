const Canvas = require("canvas")

module.exports = async () => {

    let alphabet = [..."1234567890ABCDEFGHIJKLMOPQRSTUVWXZYabcdefghijklmnopqrstuvwxyz"]

    let id = [];

    for(let i = 0; i < 6; i++) {

        id.push(alphabet[Math.floor(Math.random() * alphabet.length-1)])
    }

    const ID = id.join("")

    Canvas.registerFont("./node_modules/discord-canvas-easy/Assets/futura-bold.ttf", { family: "Futura Book"})
            
    const canvas = Canvas.createCanvas(300, 150)
    const ctx = canvas.getContext("2d");

    ctx.font = '35px "Futura Book"';
    ctx.fillStyle = "#ffffff";
    ctx.fillText(ID, (150 - (ctx.measureText(`${ID}`).width) / 2), 85)

    return {canvas: canvas, text: ID};
}
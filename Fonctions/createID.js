module.exports = async prefix => {

    let alphabet = [..."1234567890ABCDEFGHIJKLMOPQRSTUVWXZY"]

    let id = [];

    for(let i = 0; i < 10; i++) {

        id.push(alphabet[Math.floor(Math.random() * alphabet.length-1)])
    }

    const ID = `${prefix}-${id.join("")}`

    return ID;
}
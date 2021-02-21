const currentGame = require("../model/currentGame");

module.exports.process = async (rcon, message) => {
    const currentGameData = currentGame.get();

    if (!currentGameData) return;

    if (!message || typeof message !== "string") {
        return console.log("Ignored invalid scorefeed message:", message);
    }

    const messageData =
        message.match(/.*(Team 0).*now ([0-9])\.0 points.*/) ||
        message.match(/.*(Team 1).*now ([0-9])\.0 points.*/);

    if (!messageData) {
        return console.log("Ignored unneeded scorefeed message:", message);
    }

    const scoreboard = await rcon.send("scoreboard");

    const team = Number.parseInt(messageData[1].split(" ")[1]);
    const amountOfRoundsWon = Number.parseInt(messageData[2]);

    console.log(team, amountOfRoundsWon);

    const roundsUpdate = {};

    if (team === 0) {
        roundsUpdate.team0 = amountOfRoundsWon;
    } else if (team === 1) {
        roundsUpdate.team1 = amountOfRoundsWon;
    }

    currentGame.update(scoreboard, roundsUpdate);
};

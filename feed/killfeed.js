const { PlayerModel, registerPlayer } = require('../model/schema/player');
const currentGame = require('../model/currentGame');

module.exports.process = async (rcon, message) => {
  const currentGameData = currentGame.get();

  if (!currentGameData) {
    return;
  }

  const scoreboard = await rcon.send('scoreboard');

  currentGame.update(scoreboard);
};

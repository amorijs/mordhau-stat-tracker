const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  id: String,
  commonAlias: String,
  kills: Number,
  assists: Number,
  deaths: Number,
  totalScore: Number,
  roundsPlayed: Number,
  averageScore: Number
});

playerSchema.methods.addToStat = function (statName, increment) {
  const STAT_NAMES = new Set(['kills', 'assists', 'deaths']);

  if (!STAT_NAMES.has(statName)) {
    throw new Error('Stat name: ' + statName + ' does not exist');
  }

  this[statName] += increment;
  return this.save();
};

const PlayerModel = mongoose.model('Player', playerSchema);

const registerPlayer = ({
  id,
  commonAlias = '',
  averageScore = 0,
  kills = 0,
  assists = 0,
  deaths = 0
}) => {
  console.log('registering player...', {
    id,
    commonAlias,
    averageScore,
    kills,
    assists,
    deaths
  });

  if (!id || typeof id !== 'string') {
    throw new Error('Player id required');
  }

  const newPlayer = new PlayerModel({ id, commonAlias, averageScore, kills, assists, deaths });
  return newPlayer.save();
};

const getPlayer = id => {
  return PlayerModel.findOne({ id });
};

module.exports = { PlayerModel, registerPlayer };

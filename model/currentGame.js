let currentGame = null;
let mapRotationLeft = [];
const { PlayerModel, registerPlayer } = require('./schema/player');

module.exports.create = (maps = mapRotationLeft) => {
  currentGame = {};
  mapRotationLeft = maps;
};

module.exports.cancel = () => (currentGame = null);

module.exports.next = async () => {
  await module.exports.end();

  mapRotationLeft = mapRotationLeft.slice(1);

  if (mapRotationLeft.length > 0) {
    module.exports.create();
  }

  return mapRotationLeft;
};

module.exports.update = scoreboard => {
  console.log('updating scoreboard:', scoreboard);
  const scoreboardArray = scoreboard.split('\n').slice(0, -1);

  scoreboardArray.forEach(row => {
    //9BB3CF55044CB94, Terrance team manage, 0, 0, 600, 6, 0, 0
    //9BB3CF55044CB94, Terrance team manage, 0, 0, 500, 5, 1, 0
    //ID, NAME, ?, ?, score, kills, deaths, assists

    const splitByCommas = row.split(',');
    const steamFabID = splitByCommas[0];

    if (steamFabID === 'There are currently no players present.') {
      return;
    }

    const score = Number.parseInt(splitByCommas[splitByCommas.length - 4]);
    const kills = Number.parseInt(splitByCommas[splitByCommas.length - 3]);
    const deaths = Number.parseInt(splitByCommas[splitByCommas.length - 2]);
    const assists = Number.parseInt(splitByCommas[splitByCommas.length - 1]);

    const name = splitByCommas.slice(1, -6).join(',').trim();

    if (!currentGame[steamFabID]) {
      currentGame[steamFabID] = {};
    }

    console.log(name, steamFabID, score, kills, deaths, assists);

    currentGame[steamFabID].name = name;
    currentGame[steamFabID].score = score;
    currentGame[steamFabID].kills = kills;
    currentGame[steamFabID].deaths = deaths;
    currentGame[steamFabID].assists = assists;
  });
};

module.exports.get = () => currentGame;

module.exports.end = async () => {
  if (!currentGame) {
    throw new Error('Cannot finalize game, game does not exist');
  }

  const entries = Object.entries(currentGame);

  const promises = entries.map(async ([steamFabID, { score, kills, deaths, assists, name }]) => {
    let playerToUpdate = await PlayerModel.findOne({ id: steamFabID });

    if (!playerToUpdate) {
      playerToUpdate = await registerPlayer({
        id: steamFabID,
        commonAlias: name,
        totalScore: 0,
        roundsPlayed: 0,
        averageScore: 0
      });
    }

    const newTotalScore = playerToUpdate.totalScore + score;
    const newRoundsPlayed = playerToUpdate.roundsPlayed + 1;

    await playerToUpdate.update({
      kills: kills + playerToUpdate.kills,
      deaths: deaths + playerToUpdate.deaths,
      assists: assists + playerToUpdate.assists,
      totalScore: newTotalScore,
      roundsPlayed: newRoundsPlayed,
      averageScore: Math.round(newTotalScore / newRoundsPlayed)
    });
  });

  await Promise.all(promises)
    .then(() => console.log('Stats saved successfully:', currentGame))
    .catch(err => console.error('Unable to save stats:', currentGame, err));

  currentGame = null;
};

let currentGame = null;
let mapRotationLeft = [];
const { PlayerModel, registerPlayer } = require('./schema/player');

module.exports.create = (maps = mapRotationLeft) => {
  currentGame = { roundsWonByTeam0: 0, roundsWonByTeam1: 0, scoreboardData: {} };
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

module.exports.update = (scoreboard, roundsUpdate) => {
  if (roundsUpdate) {
    if (roundsUpdate.team0) {
      if (currentGame.roundsWonByTeam0 < roundsUpdate.team0) {
        currentGame.roundsWonByTeam0 = roundsUpdate.team0;
      }
    } else if (roundsUpdate.team1) {
      if (currentGame.roundsWonByTeam1 < roundsUpdate.team0) {
        currentGame.roundsWonByTeam1 = roundsUpdate.team1;
      }
    }
  }

  if (!scoreboard) {
    return;
  }

  console.log('updating scoreboard:', scoreboard);
  const scoreboardArray = scoreboard.split('\n').slice(0, -1);

  scoreboardArray.forEach(row => {
    //9BB3CF55044CB94, Terrance team manage, 0, 0, 600, 6, 0, 0
    //9BB3CF55044CB94, Terrance team manage, 0, 0, 500, 5, 1, 0
    //playfab, name, ?, ?, score, kills, deaths, assists

    const splitByCommas = row.split(',');
    const playfab = splitByCommas[0];

    if (playfab === 'There are currently no players present.') {
      return;
    }

    const score = Number.parseInt(splitByCommas[splitByCommas.length - 4]);
    const kills = Number.parseInt(splitByCommas[splitByCommas.length - 3]);
    const deaths = Number.parseInt(splitByCommas[splitByCommas.length - 2]);
    const assists = Number.parseInt(splitByCommas[splitByCommas.length - 1]);

    const name = splitByCommas.slice(1, -6).join(',').trim();

    if (!currentGame.scoreboardData[playfab]) {
      currentGame.scoreboardData[playfab] = {};
    }

    console.log(name, playfab, score, kills, deaths, assists);

    currentGame.scoreboardData[playfab].name = name;
    currentGame.scoreboardData[playfab].score = score;
    currentGame.scoreboardData[playfab].kills = kills;
    currentGame.scoreboardData[playfab].deaths = deaths;
    currentGame.scoreboardData[playfab].assists = assists;
  });
};

module.exports.get = () => currentGame;

module.exports.end = async () => {
  if (!currentGame) {
    throw new Error('Cannot finalize game, game does not exist');
  }

  const scoreboardEntries = Object.entries(currentGame.scoreboardData);

  const promises = scoreboardEntries.map(
    async ([playfab, { score, kills, deaths, assists, name }]) => {
      let playerToUpdate = await PlayerModel.findOne({ playfab });

      if (!playerToUpdate) {
        playerToUpdate = await registerPlayer({
          playfab,
          commonAlias: name,
          totalScore: 0,
          roundsPlayed: 0,
          averageScore: 0
        });
      }

      const newTotalScore = playerToUpdate.totalScore + score;
      const newRoundsPlayed =
        playerToUpdate.roundsPlayed + currentGame.roundsWonByTeam0 + currentGame.roundsWonByTeam1;

      await playerToUpdate.update({
        kills: kills + playerToUpdate.kills,
        deaths: deaths + playerToUpdate.deaths,
        assists: assists + playerToUpdate.assists,
        totalScore: newTotalScore,
        roundsPlayed: newRoundsPlayed,
        averageScore: Math.round(newTotalScore / newRoundsPlayed)
      });
    }
  );

  await Promise.all(promises)
    .then(() => console.log('Stats saved successfully:', currentGame))
    .catch(err => console.error('Unable to save stats:', currentGame, err));

  currentGame = null;
};

const formatString = require('../util/formatString');
const wait = require('../util/wait');
const currentGame = require('../model/currentGame');

const authorizedPlayFabIDs = new Set(process.env.AUTHORIZED_ADMINS.trim().split(' '));

console.log('AUTHORIZED PLAY FAB IDS:', authorizedPlayFabIDs);

const validMaps = new Set(
  process.env.VALID_MAPS.trim()
    .split(' ')
    .map(item => item.toLowerCase())
);

console.log('VALID MAPS:', validMaps);

module.exports.process = async (rcon, message) => {
  const splitMessage = message.split(',');
  const steamFabID = splitMessage[0].split(' ')[1];
  const authorized = authorizedPlayFabIDs.has(steamFabID);

  const chatMessage = splitMessage[splitMessage.length - 1].trim();
  const chatMessageSplit = chatMessage.split(' ');
  const firstWord = chatMessageSplit[0];

  if (!authorized) {
    return;
  }

  if (firstWord === '.startmatch') {
    const maps = chatMessageSplit.slice(1).map(item => item.trim());

    const mapsAreValid =
      maps.length > 0 &&
      (process.env.VALID_MAPS === '*' ||
        maps.every(map => typeof map === 'string' && validMaps.has(map.toLowerCase())));

    if (currentGame.get()) {
      return await rcon.send(
        'say MATCH ALREADY IN PLACE. TO END MATCH TYPE .endmatch TO CANCEL MATCH TYPE .cancelmatch'
      );
    }

    if (!mapsAreValid) {
      return await rcon.send(
        "say INVALID MAP ROTATION. EXAMPLE: '.startmatch skm_moshpit skm_contraband skm_alden skm_chester skm_chasm'"
      );
    }

    await rcon.send('say LIVE MATCH WILL BE STARTED');
    await rcon.send(`say CHANGING MAP TO ${maps[0]} IN 3 SECONDS`);

    setTimeout(async () => {
      const changeLevelResponse = await rcon
        .send('changelevel ' + maps[0])
        .then(formatString)
        .catch(console.error);

      await wait(5000);
      currentGame.create(maps);
      await wait(5000);

      if (changeLevelResponse === 'Successfully changed level') {
        await rcon.send('say STAT TRACKING ENABLED');
        await rcon.send('say MATCH WILL BE LIVE ON WARMUP END');
        await rcon.send('say TO CANCEL MATCH, TYPE .cancelmatch');
        await rcon.send('say GLHF');
      } else {
        //
        await rcon.send('say MATCH FAILED TO START SUCCESSFULLY');
      }
    }, 4000);
  } else if (firstWord === '.next') {
    const mapRotationLeft = await currentGame.next();

    if (mapRotationLeft.length === 0) {
      return await rcon.send(
        "say NO MORE MAPS IN ROTATION, IF FURTHER MAPS ARE REQUIRED, USE '.startmatch <map> <map>'"
      );
    }

    await rcon.send(`say CHANGING MAP TO: ${mapRotationLeft[0]}`);
    await rcon.send(`changelevel ` + mapRotationLeft[0]);
  } else if (firstWord === '.cancelmatch') {
    currentGame.cancel();
    await rcon.send('say MATCH CANCELLED SUCCESSFULLY');
  } else if (firstWord === '.endmatch') {
    currentGame.end();
    await rcon.send('say MATCH ENDED SUCCESSFULLY');
  }
};

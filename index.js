require('dotenv').config();

const { Rcon } = require('rcon-client');
const express = require('express');
const app = express();

const mongooseConnect = require('./model/mongo');
const feed = require('./feed');
const { PlayerModel } = require('./model/schema/player');

console.log('ENVIRONMENT:', process.env.NODE_ENV);

const rconConnect = async () => {
  const args = process.argv.slice(2);

  const rcon = await Rcon.connect({
    host: process.env.MORDHAU_IP,
    port: Number.parseInt(process.env.MORDHAU_PORT),
    password: process.env.MORDHAU_PW,
    timeout: 999999999
  });

  rcon.on('error', error => {
    console.error('rcon connection encountered error: ', error);
    process.exit();
  });

  rcon.on('end', message => {
    console.log('RCON DISCONNECTED:', message);
    process.exit();
  });

  rcon.send('info').then(console.log);

  setInterval(
    () =>
      rcon
        .send('info')
        // .then(console.log)
        .catch(err => {
          console.error('INFO COMMAND KEEPALIVE FAILED');
          console.error(err);
        }),
    30000
  );

  return rcon;
};

const main = async () => {
  await mongooseConnect();

  const rcon = await rconConnect();

  console.log(await rcon.send('listen killfeed'));
  console.log(await rcon.send('listen chat'));

  rcon.socket.on('data', buffer => {
    feed.proccessFeedData(rcon, buffer);
  });

  rcon.socket.on('error', (...args) => {
    console.log(
      args.map(arg => {
        try {
          return arg.toString();
        } catch {
          return arg;
        }
      })
    );
  });
};

main().catch(err => {
  console.error('UNABLE TO START STAT TRACKING SYSTEM', err);
  process.exit(1);
});

app.get('/players', (req, res) => {
  PlayerModel.find()
    .then(players => res.json(players))
    .catch(err => {
      res.status(500).json(err);
    });
});

app.listen(process.env.PORT || 5050, () => {
  console.log('App listening on' + (process.env.PORT || 5050));
});

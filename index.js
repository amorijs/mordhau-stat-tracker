require('dotenv').config();

const { Rcon } = require('rcon-client');
const mongooseConnect = require('./model/mongo');
const feed = require('./feed');

console.log('ENVIRONMENT:', process.env.NODE_ENV);

// Workaround for heroku port timeout
const http = require('http');
http.createServer(() => {}).listen(process.env.PORT || 6000);

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

main().catch(console.error);

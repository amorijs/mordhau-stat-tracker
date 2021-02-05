const formatBuffer = require('../util/formatBuffer');
const chat = require('./chat');
const killfeed = require('./killfeed');
const scorefeed = require('./scorefeed');

module.exports.proccessFeedData = (rcon, buffer) => {
  const message = formatBuffer(buffer);
  const messageType = message.split(':')[0].toLowerCase();

  if (messageType === 'chat' || messageType === 'hat') {
    console.log('Processing chat message...');
    chat.process(rcon, message).catch(console.error);
  }

  // if (messageType === 'killfeed' || messageType === 'illfeed') {
  //   console.log('Processing killfeed message...');
  //   killfeed.process(rcon, message).catch(console.error);
  // }

  if (messageType === 'scorefeed' || messageType === 'corefeed') {
    console.log('Processing scorefeed message...');
    scorefeed.process(rcon, message).catch(console.error);
  }
};

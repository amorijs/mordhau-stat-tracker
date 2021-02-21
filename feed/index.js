const chat = require("./chat");
const killfeed = require("./killfeed");
const scorefeed = require("./scorefeed");

module.exports.proccessFeedData = (rcon, message) => {
    const messageType = message.split(":")[0].toLowerCase();

    if (messageType === "chat") {
        console.log("Processing chat message...");
        chat.process(rcon, message).catch(console.error);
    }

    if (messageType === "killfeed") {
        console.log("Processing killfeed message...");
        killfeed.process(rcon, message).catch(console.error);
    }

    if (messageType === "scorefeed") {
        console.log("Processing scorefeed message...");
        scorefeed.process(rcon, message).catch(console.error);
    }
};

const formatString = require('./formatString');
module.exports = buffer => formatString(buffer.toString()).slice(2);

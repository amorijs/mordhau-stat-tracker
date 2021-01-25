const mongoose = require('mongoose');

module.exports = () =>
  new Promise((resolve, reject) => {
    mongoose.connect(process.env.MONGO_SRV, { useNewUrlParser: true });

    const db = mongoose.connection;

    db.on('error', () => reject('mongodb connection error:'));

    db.once('open', function () {
      console.log('mongodb connected!');
      resolve(db);
    });
  });

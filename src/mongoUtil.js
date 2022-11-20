const mongoose = require('mongoose');

async function connect() {
  const url = 'mongodb://localhost:27017/crypto';

  mongoose.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log('DB connected');
    }
  );
}

module.exports = { connect };

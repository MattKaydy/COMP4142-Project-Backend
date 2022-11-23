const mongoose = require('mongoose');

// url = 'mongodb://localhost:27017/crypto';
async function connect(url) {
  mongoose.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log('DB connected');
    }
  );
}

module.exports = { connect };

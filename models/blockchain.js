const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
  fromAddress: {
    type: String,
  },
  toAddress: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
  },
});

const blockSchema = mongoose.Schema({
  previousBlockHash: {
    type: String,
    required: true,
  },
  timestamp: {
    type: String,
    required: true,
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'transaction',
    },
  ],
  nonce: {
    type: Number,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
});

// const blockchainSchema = mongoose.Schema({
//   chain: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'block',
//     },
//   ],
//   miningReward: {
//     type: Number,
//     required: true,
//   },
// });

module.exports.block = new mongoose.model('block', blockSchema);
module.exports.transaction = new mongoose.model(
  'transaction',
  transactionSchema
);
// module.exports.blockchain = new mongoose.model('blockchain', blockchainSchema);

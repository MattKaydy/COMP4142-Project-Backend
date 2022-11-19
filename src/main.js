'use strict';
const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const fs = require('fs');
// const mongoose = require('mongoose');

// Connect to the database
// mongoose.connect(
//   'mongodb://localhost:27017/crypto',
//   { useNewUrlParser: true, useUnifiedTopology: true },
//   () => {
//     console.log('DB connected');
//   }
// );

// Your private key goes here
const myKey = ec.keyFromPrivate(
  '7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf'
);

// From that we can calculate your public key (which doubles as your wallet address)
const myWalletAddress = myKey.getPublic('hex');
console.log(myWalletAddress);

// Get blockchain from storage and construct it
const savjeeCoin = new Blockchain();
const dataDir = './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
const blockchainPath = './data/blockchain.json';
if (fs.existsSync(blockchainPath)) {
  savjeeCoin.constructBlockchain(blockchainPath);
}

// Mine first block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create a transaction & sign it with your key
const tx1 = new Transaction(myWalletAddress, 'address2', 100);
tx1.signTransaction(myKey);
savjeeCoin.addTransaction(tx1);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

// Create second transaction
const tx2 = new Transaction(myWalletAddress, 'address1', 50);
tx2.signTransaction(myKey);
savjeeCoin.addTransaction(tx2);

// Mine block
savjeeCoin.minePendingTransactions(myWalletAddress);

console.log();
console.log(savjeeCoin.chain);
console.log();
console.log(
  `Balance of xavier is ${savjeeCoin.getBalanceOfAddress(myWalletAddress)}`
);

// Uncomment this line if you want to test tampering with the chain
// savjeeCoin.chain[1].transactions[0].amount = 10;

// Check if the chain is valid
console.log();
console.log('Blockchain valid?', savjeeCoin.isChainValid() ? 'Yes' : 'No');

// fs.writeFileSync('./data/blockchain.json', util.inspect(savjeeCoin), 'utf-8');
const data = JSON.stringify(savjeeCoin);
fs.writeFileSync('./data/blockchain.json', data);

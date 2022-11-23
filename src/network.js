'use strict';
const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const { connect } = require('./mongoUtil');
const express = require('express');
const app = express();
const request = require('request');

async function main() {
  await connect('mongodb://localhost:27017/crypto');

  // Your private key goes here
  const myKey = ec.keyFromPrivate(
    '7c4c45907dec40c91bab3480c39032e90049f1a44f3e18c3e07c23e3273995cf'
  );

  // From that we can calculate your public key (which doubles as your wallet address)
  const myWalletAddress = myKey.getPublic('hex');
  console.log(myWalletAddress);

  // Get blockchain from storage and construct it
  const savjeeCoin = new Blockchain();
  await savjeeCoin.constructBlockchain();

  // Listen to port
  const portNumber = 1111;
  app.listen(portNumber, function () {
    console.log('Listening on port ' + portNumber);
  });

  app.use(express.json());

  // Post current block to peers
  const data = {
    url: 'http://localhost:2222/postcurrentblock',
    json: true,
    body: savjeeCoin.getLatestBlock(),
  };
  request.post(data, function (error, response, body) {
    console.log('Post current block to peers: Success');
    if (!error && response.statusCode === 200) {
      const blockchainFromPeer = response.body;
      if (
        blockchainFromPeer != null &&
        savjeeCoin.chain.length < blockchainFromPeer.length
      ) {
      }
    }
  });

  // receive post current block POST
  app.post('/postcurrentblock', async (req, res, next) => {
    console.log(req.body.answer);
    try {
      console.log('Receive post current block: Success');
      const blockFromPeer = req.body;
      if (blockFromPeer.hash !== savjeeCoin.getLatestBlock().hash) {
        return res.status(200).send(savjeeCoin.chain);
      }
      return res.status(200);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  });

  // Mine first block
  await savjeeCoin.minePendingTransactions(myWalletAddress);

  // Post a mined block to peers
  const data = {
    url: 'http://localhost:2222/postminedblock',
    json: true,
    body: savjeeCoin.getLatestBlock(),
  };
  request.post(data, function (error, response, body) {
    console.log('Post mined block to peers: Success');
    if (!error && response.statusCode === 200) {
      console.log('Peer receive mined block: Success');
    }
  });
}
main();

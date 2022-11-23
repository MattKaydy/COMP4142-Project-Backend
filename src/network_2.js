'use strict';
const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const { connect } = require('./mongoUtil');
const express = require('express');
const app = express();
const request = require('request');
const TransactionModel = require('../models/blockchain').transaction;
const Block = require('./blockchain').block;

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
  const portNumber = 2222;
  app.listen(portNumber, function () {
    console.log('Example app listening on port ' + portNumber);
  });

  app.use(express.json());

  // receive mined block from peer
  app.post('/postminedblock', async (req, res, next) => {
    console.log('Received Peer mined block.');
    try {
      const block = req.body;
      console.log(block);
      if (block.previousBlockHash === savjeeCoin.getLatestBlock().hash) {
        // Each transaction of a block. Create transaction objects in a block
        const transactiions = block.transactions;
        const transactiionObjArray = [];
        for (let i = 0; i < transactiions.length; i++) {
          const transactiionID = transactiions[i];
          const transactiion = await TransactionModel.findById(transactiionID);
          if (transactiion == null) {
            console.log(
              'Error: Cannot find transaction when constructing blockchain. In block:' +
                block.index +
                ' transaction:' +
                transactiionID
            );
            continue;
          }
          const transactionObj = new Transaction(
            transactiion.fromAddress,
            transactiion.toAddress,
            transactiion.amount
          );
          transactionObj.setTimestamp(transactiion.timestamp);
          if (transactiion.signature != null) {
            transactionObj.signature = transactiion.signature;
          }
          if (transactionObj != null) {
            transactionObj.saveTransactionToDB();
            transactiionObjArray.push(transactionObj);
          }
        }

        // Create bock object
        const blockObj = new Block(
          block.timestamp,
          transactiionObjArray,
          block.previousBlockHash
        );
        blockObj.setIndex(block.index);
        blockObj.setDifficulty(block.difficulty);
        blockObj.setNonce(block.nonce);
        blockObj.setRoot(block.root);

        // Put a block to chain
        this.chain.push(blockObj);
        blockObj.saveBlockToDB();
      }
      return res.status(200);
    } catch (err) {
      console.log(err);
      return res.sendStatus(500);
    }
  });
}
main();

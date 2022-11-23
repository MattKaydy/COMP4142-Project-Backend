'use strict';
const { Blockchain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const { connect } = require('./mongoUtil');
const prompt = require('prompt-sync')();

async function main() {
  await connect();

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

  var isPromptDone = false;
  var option = "";
  var option2 = "";
  var targetAddress = "";
  var transferCost = "";

  while (isPromptDone == false)
  {
    console.clear();
     // Print main menu
  console.log("Wecome to COMP4142 Project Demo!");
  console.log("Wallet Address: "+myWalletAddress);
  console.log("Mining difficulty: "+savjeeCoin.getLatestBlock().difficulty);
  console.log("Current Mining Reward: "+savjeeCoin.miningReward);
  console.log("Current Wallet Balance: "+savjeeCoin.getBalanceOfAddress(myWalletAddress));
  console.log("Latest Block Index: "+savjeeCoin.getLatestBlock().index);

  console.log("==============");
  console.log("Select an action:");
  console.log("1: Show the Whole Blockchain list");
  console.log("2: Show Block Data of Specified Block in the Blockchain");
  console.log("3: Show a Transaction list in a block");
  console.log("4: Create Transaction");
  console.log("5: Show UTXO Pool");
  console.log("6. Mine Block");
  console.log("0. Exit");

  option = prompt("Enter an option: ");


  if (Number(option) === 0) {
    console.clear();
    console.log("Goodbye! Run node main.js to restart program.")

    isPromptDone = true;
  }

  else if (Number(option) === 1) {
    console.clear();
    console.log(savjeeCoin.chain);
    option2 = prompt("Press enter to exit");
  }
  else if (Number(option) === 2) {
    console.clear();
    option2 = prompt("Enter a block index to check its block data: ");
    console.log(savjeeCoin.chain[option2]);
    option2 = prompt("Press enter to exit");
  }
  else if (Number(option) === 3) {
    console.clear();
    option2 = prompt("Enter a block index to check its transaction list: ");
    console.log(savjeeCoin.chain[option2].transactions);
    option2 = prompt("Press enter to exit");
  }
  else if (Number(option) === 4) {
    console.clear();

    targetAddress = prompt("Enter sender address: ");
    transferCost = prompt("Enter money to transfer: ");
    var tx1 = new Transaction(myWalletAddress, 'address2', Number(transferCost));
    tx1.signTransaction(myKey);
    savjeeCoin.addTransaction(tx1);

    console.log("Transaction added to UTXO. Mine a block to execute the transaction.");
    option2 = prompt("Press enter to exit");
  }
  else if (Number(option) === 5) {
    console.clear();
    console.log(savjeeCoin.pendingTransactions);
    option2 = prompt("Press enter to exit");
  }
  else if (Number(option) === 6) {
    console.clear();
    console.log("Mining block to address "+myWalletAddress+ "...");
    await savjeeCoin.minePendingTransactions(myWalletAddress);
    console.log("Block mined to address "+myWalletAddress+ " !");
    option2 = prompt("Press enter to exit");
  }



  }
 


  // // Mine first block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);



  // // Create a transaction & sign it with your key
  // const tx1 = new Transaction(myWalletAddress, 'address2', 100);
  // tx1.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx1);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx2 = new Transaction(myWalletAddress, 'address1', 5);
  // tx2.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx2);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx3 = new Transaction(myWalletAddress, 'address1', 2);
  // tx3.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx3);

  // // Create second transaction
  // const tx4 = new Transaction(myWalletAddress, 'address1', 2);
  // tx4.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx4);

  // // Create second transaction
  // const tx5 = new Transaction(myWalletAddress, 'address1', 5);
  // tx5.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx5);

  // // Create second transaction
  // const tx6 = new Transaction(myWalletAddress, 'address1', 5);
  // tx6.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx6);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx7 = new Transaction(myWalletAddress, 'address1', 5);
  // tx7.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx7);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx8 = new Transaction(myWalletAddress, 'address1', 50);
  // tx8.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx8);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx9 = new Transaction(myWalletAddress, 'address1', 50);
  // tx9.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx9);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx10 = new Transaction(myWalletAddress, 'address1', 50);
  // tx10.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx10);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx11 = new Transaction(myWalletAddress, 'address1', 50);
  // tx11.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx11);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx12 = new Transaction(myWalletAddress, 'address1', 50);
  // tx12.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx12);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx13 = new Transaction(myWalletAddress, 'address1', 50);
  // tx13.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx12);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx14 = new Transaction(myWalletAddress, 'address1', 50);
  // tx14.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx14);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx15 = new Transaction(myWalletAddress, 'address1', 50);
  // tx15.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx15);

  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // // Create second transaction
  // const tx16 = new Transaction(myWalletAddress, 'address1', 50);
  // tx16.signTransaction(myKey);
  // savjeeCoin.addTransaction(tx16);
  // // Mine block
  // await savjeeCoin.minePendingTransactions(myWalletAddress);

  // console.log();
  // console.log(savjeeCoin.chain);
  // console.log();
  // console.log(
  //   `Balance of xavier is ${savjeeCoin.getBalanceOfAddress(myWalletAddress)}`
  // );

  // // Uncomment this line if you want to test tampering with the chain
  // // savjeeCoin.chain[1].transactions[0].amount = 10;

  // // Check if the chain is valid
  // console.log();
  // console.log('Blockchain valid?', savjeeCoin.isChainValid() ? 'Yes' : 'No');
  // const x = 1;

  // savjeeCoin.saveDataToCache();

  

  // console.log('Blockchain Height: ' + savjeeCoin.getDataFromCache("Height"));
  // console.log('Blockchain NodeList: ');
  // console.log(savjeeCoin.getDataFromCache("NodeList"));
  // console.log('UTXO: ')
  // savjeeCoin.getDataFromCache("UTXO");
  process.exit();

}

main();

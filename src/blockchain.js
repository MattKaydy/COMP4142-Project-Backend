'use strict';
const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const debug = require('debug')('COMP4142-Project-Backend:blockchain');

class Transaction {
  /**
   * @param {string} fromAddress
   * @param {string} toAddress
   * @param {number} amount
   */
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.timestamp = Date.now();
  }

  /**
   * Creates a SHA256 hash of the transaction
   *
   * @returns {string}
   */
  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(this.fromAddress + this.toAddress + this.amount + this.timestamp)
      .digest('hex');
  }

  /**
   * Signs a transaction with the given signingKey (which is an Elliptic keypair
   * object that contains a private key). The signature is then stored inside the
   * transaction object and later stored on the blockchain.
   *
   * @param {string} signingKey
   */
  signTransaction(signingKey) {
    // You can only send a transaction from the wallet that is linked to your
    // key. So here we check if the fromAddress matches your publicKey
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }

    // Calculate the hash of this transaction, sign it with the key
    // and store it inside the transaction object
    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');

    this.signature = sig.toDER('hex');
  }

  /**
   * Checks if the signature is valid (transaction has not been tampered with).
   * It uses the fromAddress as the public key.
   *
   * @returns {boolean}
   */
  isValid() {
    // If the transaction doesn't have a from address we assume it's a
    // mining reward and that it's valid. You could verify this in a
    // different way (special field for instance)
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block {
  /**
   * @param {number} timestamp
   * @param {Transaction[]} transactions
   * @param {string} previousBlockHash
   */
  constructor(timestamp, transactions, previousBlockHash = '') {
    this.previousBlockHash = previousBlockHash;
    this.index = 0;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.difficulty = 2;
    this.nonce = 0;
    this.root = this.build_merkle_tree(this.padding(transactions)).hash;
    this.hash = this.calculateHash();
  }

  /**
   *
   * @param {number} index
   */
  setIndex(index) {
    this.index = index;
    this.hash = this.calculateHash();
  }

  /**
   *
   * @param {number} difficulty
   */
  setDifficulty(difficulty) {
    this.difficulty = difficulty;
    this.hash = this.calculateHash();
  }

  /**
   * Returns the SHA256 of this block (by processing all the data stored
   * inside this block)
   *
   * @returns {string}
   */
  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.previousBlockHash +
          this.timestamp +
          JSON.stringify(this.transactions) +
          this.nonce +
          this.index +
          this.difficulty +
          this.root
      )
      .digest('hex');
  }

  /**
   * Starts the mining process on the block. It changes the 'nonce' until the hash
   * of the block starts with enough zeros (= difficulty)
   *
   * @param {number} difficulty
   */
  mineBlock() {
    while (
      this.hash.substring(0, this.difficulty) !==
      Array(this.difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    debug(`Block mined: ${this.hash}`);
    this.end = Date.now();
  }

  /**
   * Takes all the pending transactions, padding before puts them in a Merkle Tree.
   *  It add pad if the amount of transaction cannot struct a tree.
   *
   * @param {Object} Transactions
   */

  padding(Transactions) {
    const size = Transactions.length;
    if (size === 0) {
      return [''];
    }
    const reducedSize = parseInt(Math.pow(2, parseInt(Math.log2(size))));

    let padSize = 0;
    if (reducedSize !== size) {
      padSize = 2 * reducedSize - size;
    }
    for (let i = 0; i < padSize; i++) {
      const pad = new Transaction(null, '', '');
      Transactions.push(pad);
    }
    return Transactions;
  }

  /**
   * After padding, takes all the pending transactions in a Merkle Tree and starts the
   * tree process. Output the first node.
   *
   * @param {Object} Transactions
   */
  build_merkle_tree(Transactions) {
    let nodes = [];

    for (const tran of Transactions) {
      const i = this.merkleNode(tran);
      nodes.push(i);
    }

    while (nodes.length !== 1) {
      const temp = [];
      for (let node = 0; node < nodes.length; node += 2) {
        const node1 = nodes[node];
        const node2 = nodes[node + 1];
        const concatHash = node1.hash + node2.hash;
        const parent = this.merkleNode(concatHash);
        parent.left = node1;
        parent.right = node2;
        temp.push(parent);
      }
      nodes = temp;
    }
    return nodes[0];
  }

  /**
   * Input a transaction / a concat hash of two children nodes.
   * SHA256 of them and output a node structure.
   *
   * @param {Object} Transactions
   */
  merkleNode(value) {
    const left = '';
    const right = '';
    let hash = 0;
    if (typeof value === 'string') {
      hash = crypto.createHash('sha256').update(value).digest('hex');
    } else {
      hash = crypto
        .createHash('sha256')
        .update(
          value.fromAddress + value.toAddress + value.amount + value.timestamp
        )
        .digest('hex');
    }
    return { left, right, value, hash };
  }

  /**
   * Validates all the transactions inside this block (signature + hash) and
   * returns true if everything checks out. False if the block is invalid.
   *
   * @returns {boolean}
   */
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }

    return true;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  /**
   * @returns {Block}
   */
  createGenesisBlock() {
    return new Block(Date.parse('2017-01-01'), [], '0');
  }

  /**
   * Returns the latest block on our chain. Useful when you want to create a
   * new Block and you need the hash of the previous Block.
   *
   * @returns {Block[]}
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Takes all the pending transactions, puts them in a Block and starts the
   * mining process. It also adds a transaction to send the mining reward to
   * the given address.
   *
   * @param {string} miningRewardAddress
   */
  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    this.index += 1;

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );

    // Adjust diificulty
    let difficulty = this.getLatestBlock().difficulty;
    if (this.chain.length > 11) {
      let accum = 0;
      for (let i = this.chain.length; i >= this.chain.length - 10; i--) {
        const blockTime =
          this.chain[i - 1].timestamp - this.chain[i - 2].timestamp;
        accum += blockTime;
      }
      difficulty = parseInt((difficulty * (10 * 0.02 * 1000)) / accum);
      // console.log(parseInt((this.difficulty * (10 * 0.5 * 1000)) / this.accum));
      console.log(parseInt(difficulty));
      block.setIndex(this.chain.length);
      block.setDifficulty(difficulty);
    }

    block.mineBlock();

    debug('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  /**
   * Add a new transaction to the list of pending transactions (to be added
   * next time the mining process starts). This verifies that the given
   * transaction is properly signed.
   *
   * @param {Transaction} transaction
   */
  addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to address');
    }

    // Verify the transactiion
    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transaction to chain');
    }

    if (transaction.amount <= 0) {
      throw new Error('Transaction amount should be higher than 0');
    }

    // Making sure that the amount sent is not greater than existing balance
    const walletBalance = this.getBalanceOfAddress(transaction.fromAddress);
    if (walletBalance < transaction.amount) {
      throw new Error('Not enough balance');
    }

    // Get all other pending transactions for the "from" wallet
    const pendingTxForWallet = this.pendingTransactions.filter(
      (tx) => tx.fromAddress === transaction.fromAddress
    );

    // If the wallet has more pending transactions, calculate the total amount
    // of spend coins so far. If this exceeds the balance, we refuse to add this
    // transaction.
    if (pendingTxForWallet.length > 0) {
      const totalPendingAmount = pendingTxForWallet
        .map((tx) => tx.amount)
        .reduce((prev, curr) => prev + curr);

      const totalAmount = totalPendingAmount + transaction.amount;
      if (totalAmount > walletBalance) {
        throw new Error(
          'Pending transactions for this wallet is higher than its balance.'
        );
      }
    }

    this.pendingTransactions.push(transaction);
    debug('transaction added: %s', transaction);
  }

  /**
   * Returns the balance of a given wallet address.
   *
   * @param {string} address
   * @returns {number} The balance of the wallet
   */
  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    debug('getBalanceOfAdrees: %s', balance);
    return balance;
  }

  /**
   * Returns a list of all transactions that happened
   * to and from the given wallet address.
   *
   * @param  {string} address
   * @return {Transaction[]}
   */
  getAllTransactionsForWallet(address) {
    const txs = [];

    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          txs.push(tx);
        }
      }
    }

    debug('get transactions for wallet count: %s', txs.length);
    return txs;
  }

  /**
   * Loops over all the blocks in the chain and verify if they are properly
   * linked together and nobody has tampered with the hashes. By checking
   * the blocks it also verifies the (signed) transactions inside of them.
   *
   * @returns {boolean}
   */
  isChainValid() {
    // Check if the Genesis block hasn't been tampered with by comparing
    // the output of createGenesisBlock with the first block on our chain
    const realGenesis = JSON.stringify(this.createGenesisBlock());

    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    // Check the remaining blocks on the chain to see if there hashes and
    // signatures are correct
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (previousBlock.hash !== currentBlock.previousBlockHash) {
        return false;
      }

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
    }

    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;

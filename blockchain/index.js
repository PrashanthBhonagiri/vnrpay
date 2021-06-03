const Block =require('./block');
const { cryptoHash } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({
           lastBlock :  this.chain[this.chain.length-1],
           data,
        });
        this.chain.push(newBlock);
    }
    validTransactionData({ chain }) {
        for(let i=1;i<chain.length;i++) {
            const block = chain[i];
            const transactionSet = new Set();
            let rewardTransactionCount=0;
            for(let transaction of block.data) {
                if(transaction.input.address === REWARD_INPUT.address){
                    rewardTransactionCount++;
                    if(rewardTransactionCount > 1) {
                        return false;
                    }
                    if(Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        return false;
                    }
                }
                else {
                    if(!Transaction.validTransaction(transaction)){
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain : this.chain,
                        address : transaction.input.address,
                    });
                    if(transaction.input.amount !== trueBalance) {
                        return false;
                    }
                    if(transactionSet.has(transaction)) {
                        return false;
                    }
                    else {
                        transactionSet.add(transaction);
                    }
                }
            }
        }
        return true;
    }
    static isValidChain(chain){
        
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){
            return false;
        }

        for(let i=1; i<chain.length; i++) {
            const { timestamp, lastHash, hash, data, difficulty, nonce} = chain[i];
            const actualLastHash = chain[i-1].hash;
            const lastDifficulty = chain[i-1].difficulty;

            if(lastHash !== actualLastHash) {
                // console.log("problem with last hash");
                return false;
            }
            if(Math.abs(lastDifficulty - difficulty) > 1 ){
                // console.log("problem diff");
                
                return false;
            } 
                

            const validatedHash = cryptoHash(timestamp, lastHash, data, difficulty, nonce);
            // console.log("validatedHash = ", validatedHash);
            if(validatedHash !== hash) {
                // console.log("problem with hash");

                return false;
            }


        }
        return true;
    };

    replaceChain(chain, onSuccess) {
        // console.log("replaceChain called");
        if (chain.length <= this.chain.length) {
            // console.error("incoming chain must be longer");
            return ;
        }
        if( !Blockchain.isValidChain(chain)) {
            // console.error("incoming chain must be valid");
            return ;
        }
        if(onSuccess) {
            onSuccess();
        }
        // console.log("replacing chain with ", chain);
        this.chain = chain;

    }

};

module.exports = Blockchain;
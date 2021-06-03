const Transaction = require("./transaction");


class TransactionPool {

    constructor() {
        this.transactionMap = {};
    };
    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction;
    };
    clear() {
        //final step of mine transaction clears the local pool
        this.transactionMap ={};

    }
    setMap(transactionMap) {
        this.transactionMap = transactionMap;
    };

    existingTransaction ({inputAddress}) {
        const transactions = Object.values(this.transactionMap);

        return transactions.find(transaction => transaction.input.address === inputAddress);
    };
    validTransactions() {
        return Object.values(this.transactionMap).filter(
            transaction => Transaction.validTransaction(transaction) );
    };

    clearBlockchainTransactions({chain}) {
        // for peers call this method when they acceot the new block chain to be replaced
        for(let i=1;i<chain.length;i++){
            const block = chain[i];

            for(let transaction of block.data) {
                if(this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id];
                }
            }
        }
    }
};
module.exports = TransactionPool;
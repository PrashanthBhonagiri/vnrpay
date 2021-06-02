const {v1 : uuidV1} = require('uuid');
const { verifySignature } = require('../util');



class Transaction {

    constructor({ senderWallet, recipient, amount }) {

        this.id = uuidV1();
        this.outputMap = this.createOutputMap({ senderWallet, recipient, amount});

        this.input = this.createInput({senderWallet, outputMap : this.outputMap});
    };

    createOutputMap({ senderWallet, recipient, amount}) {
        const outputMap = {};

        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;

        return outputMap;
    };

    createInput({senderWallet, outputMap}) {
        
        return {
            timestamp : Date.now(),
            amount : senderWallet.balance,
            address : senderWallet.publicKey,
            signature : senderWallet.sign(outputMap),
        };
    };

    static validTransaction( transaction ) {
        const { input, outputMap} = transaction;
        const { address, amount, signature} = input;
        // console.log("outputMap", outputMap);
        const outputTotal = Object.values(outputMap).reduce((total, outputAmount) => total+outputAmount);

        if(amount != outputTotal) {
            // console.log("amount = ", amount, "outputTotal = ", outputTotal);
            return false;
        }

        if(!verifySignature({publicKey : address, data : outputMap, signature})) {
            return false;
        }

        return true;
    };

    update( {senderWallet, recipient, amount}) {

        if(amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance');
        }
        if(this.outputMap[recipient]){
            this.outputMap[recipient] += amount;
        }
        else {
            this.outputMap[recipient] = amount;
        }

        this.outputMap[senderWallet.publicKey] -= amount;
        this.input = this.createInput({senderWallet, outputMap : this.outputMap});
    }
};

module.exports = Transaction;
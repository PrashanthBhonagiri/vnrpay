const Block =require('./block');
const cryptoHash = require('./crypto-hash');

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

    replaceChain(chain) {
        console.log("replaceChain called");
        if (chain.length <= this.chain.length) {
            // console.error("incoming chain must be longer");
            return ;
        }
        if( !Blockchain.isValidChain(chain)) {
            // console.error("incoming chain must be valid");
            return ;
        }
        // console.log("replacing chain with ", chain);
        this.chain = chain;
    }

};

module.exports = Blockchain;
const hexToBinary = require('hex-to-binary');
const { GENESIS_DATA, MINE_RATE } = require("../config");
const {cryptoHash} = require("../util");

class Block {
    constructor({timestamp, lastHash, hash, data, nonce, difficulty}) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis () {
        // return new Block(GENESIS_DATA);
        return new this(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data }) {
        const lastHash = lastBlock.hash;
        let hash, nonce=0, timestamp ;
        let {difficulty } = lastBlock;

        do {
            nonce++;
            timestamp = new Date();
            // console.log("timestamp in do-while loop - " ,timestamp);
            difficulty = Block.adjustDifficulty({originalBlock : lastBlock, timestamp});
            hash = cryptoHash(timestamp, lastHash, data, difficulty, nonce);
        } while (hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty));

        // console.log({
        //     timestamp, 
        //     lastHash,
        //     data ,
        //     hash , 
        // });
        // console.log("returning timestamp from mine block = ", timestamp);
        return new this({
            timestamp, 
            lastHash,
            data ,
            hash ,
            nonce,
            difficulty
        });

    };

    static adjustDifficulty({originalBlock, timestamp}) {
        const { difficulty } = originalBlock;

        if(difficulty <1) return 1;

        if((timestamp-originalBlock.timestamp) > MINE_RATE) return difficulty-1;
        return difficulty+1;
    }

}
module.exports = Block ;
const Blockchain = require("./blockchain");

const blockchain = new Blockchain();

blockchain.addBlock({ data : 'initail block'});

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

for (let i=0;i<1000;i++) {
    prevTimestamp = blockchain.chain[blockchain.chain.length-1].timestamp;

    blockchain.addBlock({ data : `block ${i}`});
    nextBlock = blockchain.chain[blockchain.chain.length-1];

    nextTimestamp = nextBlock.timestamp;
    timeDiff = nextTimestamp - prevTimestamp;
    times.push(timeDiff);

    average =times.reduce((total,num) => (total+num))/times.length;

    console.log(
        `time to mine block : ${timeDiff}ms \n 
        Difficluty: ${nextBlock.difficulty} \n
        Average time : ${average}ms
        `);
}
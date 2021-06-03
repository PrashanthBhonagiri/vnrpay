const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const request = require('request');

require('dotenv').config();

const Blockchain = require('./blockchain');
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const app = express();

app.use(morgan('dev'));
app.use(express.json());  
app.use(helmet());

const DEFAULT_PORT = 5000;
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

// const whitelist = [
//     'http://localhost:4200',
//     'http://localhost:5000',  
// ];
// var corsOptions = {
//     origin: function (origin, next) {
//         if (whitelist.indexOf(origin) !== -1 || !origin) {
//         next(null, true)
//         } else {
//         next(new Error('Not allowed by CORS'))
//         }
//     }
// }
  
app.use(cors());

const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({ blockchain, transactionPool, wallet });
const transactionMiner = new TransactionMiner({blockchain, transactionPool,wallet,pubsub});

// setTimeout(() =>pubsub.broadcastChain(), 1000);

// app.get('/',cors(corsOptions),()=>{

app.get('/api/blocks',(req,res,next)=>{
    res.json({
        status : true,
        Blockchain :  blockchain.chain
    });
}); 

app.post('/api/mine',(req,res,next) =>{
    const {data } = req.body;
    
    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req,res,next) =>{
    const { amount, recipient} = req.body;
    try {
        let transaction = transactionPool.existingTransaction({inputAddress : wallet.publicKey});
        if(transaction ) {
            console.log(transaction);
            transaction.update({senderWallet : wallet, recipient, amount});
        }
        else {
            transaction = wallet.createTransaction({
                recipient,
                amount,
                chain : blockchain.chain
            });
        }
        transactionPool.setTransaction(transaction);
        pubsub.broadcastTransaction(transaction);
        // console.log('transactionPool = ', transactionPool);
    
        res.json({ status : true,transaction });

    }catch(err) {
        next(err);
    };


});

app.get('/api/transaction-pool-map',(req,res,next) =>{
    res.json({
        status : true,
        transactionPoolMap : transactionPool.transactionMap
    })
});

app.get('/api/mine-transactions',(req,res,next)=>{
    transactionMiner.mineTransactions();
    res.redirect('/api/blocks');
});

app.get('/api/wallet-info',(req,res,next)=>{
    const address = wallet.publicKey;
    res.json({
        status : true,
        address,
        balance : Wallet.calculateBalance({chain : blockchain.chain, address}), 
    })
});

const syncWithRootState = () => {
    request({url : `${ROOT_NODE_ADDRESS}/api/blocks`}, (error,response, body) =>{
        if( !error && response.statusCode === 200) {
            const rootChain = JSON.parse(body);
            // console.log('replace chain on a sync  from sync chains function');
            blockchain.replaceChain(rootChain, true);
        }
    });

    request({url : `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`}, (error, response, body) =>{
        if( !error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);

            // console.log("replace transaction pool on sync ", rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap.transactionPoolMap);
        }
    });

};

function notFound(req, res, next) {
    res.status(404);
    const error = new Error(`Not Found - ${  req.originalUrl}`);
    next(error);
}
  
function errorHandler(err, req, res) {
//   console.log(err);
    res.status(res.statusCode || 400);
    res.json({
      status: false,
      message: err.message,
    //   stack: err.stack,
    });
}

app.use(notFound);
app.use(errorHandler);

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log('Listening on port', PORT);
    if( PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});

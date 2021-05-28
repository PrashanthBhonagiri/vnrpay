const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config();

const Blockchain = require('./blockchain');
const PubSub = require('./pubsub');
const app = express();

app.use(morgan('dev'));
app.use(express.json());  
app.use(helmet());

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
const pubsub = new PubSub({blockchain}); 

setTimeout(() =>pubsub.broadcastChain(), 1000);

// app.get('/',cors(corsOptions),()=>{

app.get('/api/blocks',(req,res,next)=>{
    res.json(blockchain.chain);
}); 

app.post('/api/mine',(req,res,next) =>{
    const {data } = req.body;
    
    blockchain.addBlock({ data });

    pubsub.broadcastChain();

    res.redirect('/api/blocks');
});

function notFound(req, res, next) {
    res.status(404);
    const error = new Error(`Not Found - ${  req.originalUrl}`);
    next(error);
}
  
function errorHandler(err, req, res, next) {
  console.log(err);
    res.status(res.statusCode || 500);
    res.json({
      status: false,
      message: err.message,
      stack: err.stack,
    });
}
  
app.use(notFound);
app.use(errorHandler);

const DEFAULT_PORT = 5000;
let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = process.env.PORT || PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const Blockchain = require('./blockchain');

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

// app.get('/',cors(corsOptions),()=>{

app.get('/api/blocks',(req,res,next)=>{
    res.json(blockchain.chain);
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

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log('Listening on port', port);
});

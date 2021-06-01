const crypto = require('crypto');
// native crypto module of nodejs
// for native moduels actual path is not required, just module name works ! 

const cryptoHash = (...args) => {
    const hash = crypto.createHash('sha256');
    // console.log("from crypto hash, args.sortand join  = " , args.sort().join(' '));
    hash.update(args.map(input => JSON.stringify(input)).sort().join(' '));

    return hash.digest('hex');
};

module.exports = cryptoHash;
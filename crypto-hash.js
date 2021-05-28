const crypto = require('crypto');
// native crypto module of nodejs
// for native moduels actual path is not required, just module name works ! 

const cryptoHash = (...args) => {
    const hash = crypto.createHash('sha256');

    hash.update(args.sort().join(' '));

    return hash.digest('hex');
};

module.exports = cryptoHash;
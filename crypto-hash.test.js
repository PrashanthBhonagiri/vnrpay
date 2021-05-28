const cryptoHash = require('./crypto-hash');

describe('cryptoHash', () => {
    
    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('genesisHash')).toEqual('d359f50f9509d3951bb526812bf5add7d5238b3e5b40d5e71ecd382db8956b8f');
    });

    it('produces the same hash with same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('two', 'one', 'three'));
    });
})

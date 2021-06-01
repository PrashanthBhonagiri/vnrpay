const cryptoHash = require('./crypto-hash');

describe('cryptoHash', () => {
    
    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('genesisHash')).toEqual('d4b0b59ae389c97aba2c538f657a3d5557dcab6800781cf95b998400d0fc0d1f');
    });

    it('produces the same hash with same input arguments in any order', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('two', 'one', 'three'));
    });
})

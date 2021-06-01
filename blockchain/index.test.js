const Blockchain = require('./index');
const Block = require('./block');
const cryptoHash = require('../util/crypto-hash');

describe('Blockchian', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        originalChain = blockchain.chain;
        newChain = new Blockchain();
    });
    it('contains a `chain` Array instance', () =>{
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () =>{
        const newData = 'test block';
        blockchain.addBlock({data : newData});

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData);
    });

    describe('isValidChain()', () => {
        describe('when the chain does not start with genesis block', () => {
            it('return false',() =>{
                blockchain.chain[0] = {
                    data : 'fake-genesis'
                };
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });     
        });
        describe('when the chain starts with the genesis block and has multiple blocks', () => {

            beforeEach(() =>{
                blockchain.addBlock({
                    data : 'qweosid'
                });
                blockchain.addBlock({
                    data : 'sdfsdlk'
                });
                blockchain.addBlock({
                    data : 'zxcvn'
                });
            });
            describe('and a lastHash reference has changed', () => {
                it('return false',() =>{
                    
                    blockchain.chain[2].lastHash = 'broken-lasthash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
                describe('and the chain contains a block with an invalid field', () => {
                    it('return false',() =>{
                        
                        blockchain.chain[2].data = 'dome-dummy-data';
                        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                    
                    }); 
                });

                describe('and the chain contains a block with a jumped difficulty', () => {
                    it('returns false', ()=>{
                        const lastBlock = blockchain.chain[blockchain.chain.length-1];
                        const lastHash = lastBlock.hash;
                        const timestamp = Date.now();
                        const nonce = 0;
                        const data = []; 
                        const difficulty = lastBlock.difficulty-3;

                        const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

                        const badBlock = new Block({
                            timestamp, lastHash, hash, nonce, difficulty, data
                        });

                        blockchain.chain.push(badBlock);

                        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                    });
                })
                
                describe('and the chain doesnt contain any invalid blocks', () => {
                    it('return true',() =>{
                        
                        expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);

                    });
                })
                
            })
            
        })
        
        
    });
    describe('repalceChain()', () => {
        
        describe('when the new chain is not longer', () => {
            it('does not repalce the chain',() =>{
                newChain.chain[0] ={ new : 'Chain'};
                
                blockchain.replaceChain(newChain.chain);

                expect(blockchain.chain).toEqual(originalChain);
            });
        });

        describe('when the new chain is longer', () => {
            beforeEach(() =>{
                newChain.addBlock({
                    data : 'qweosid'
                });
                newChain.addBlock({
                    data : 'sdfsdlk'
                });
                newChain.addBlock({
                    data : 'zxcvn'
                });
            });
            describe('and the chain is invalid', () => {
                it('does not repalce the chain',() =>{
                    newChain.chain[2].hash = 'fake-hash';
                    blockchain.replaceChain(newChain.chain);

                    expect(blockchain.chain).toEqual(originalChain);
                }); 
            })
            describe('and the chain is valid', () => {
                it('replaces the chain',() =>{
                    blockchain.replaceChain(newChain.chain);

                    expect(blockchain.chain).toEqual(newChain.chain);
                });
            })
            
            
        })
        
        
    })
    
})

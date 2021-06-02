const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util');

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount ;

    beforeEach(() =>{
        senderWallet = new Wallet();
        recipient = 'publickey-recipient';
        amount = 500;
        transaction = new Transaction({senderWallet, recipient, amount});
    });

    it('has an `id`', ()=>{
        expect(transaction).toHaveProperty('id');
    });

    describe('outputMap', () => {
        it('has an outputMap', ()=>{
            expect(transaction).toHaveProperty('outputMap');
        });
        it('outputs the amount to the recipient', ()=>{
            expect(transaction.outputMap[recipient]).toEqual(amount);
        });

        it('outputs the remaining balance for the `sender wallet`', ()=>{
            expect(transaction.outputMap[senderWallet.publicKey]).toEqual(senderWallet.balance - amount);
        });
    });

    describe('input', () => {
        it('has an input', () =>{
            expect(transaction).toHaveProperty('input');
        });
        it('has a timestamp',() =>{
            expect(transaction.input).toHaveProperty('timestamp');
        });
        it('sets the amount to the `senderWallet balance`', () =>{
            expect(transaction.input.amount).toEqual(senderWallet.balance);
        });
        it('sets the `address` to the senderWallet publickey', ()=>{
            expect(transaction.input.address).toEqual(senderWallet.publicKey);
        });

        it('signs the input', ()=>{
            expect(
                verifySignature({
                    publicKey : senderWallet.publicKey,
                    data : transaction.outputMap,
                    signature : transaction.input.signature,
                })
            ).toBe(true);
            
        });

    });

    describe('validTransaction()', () => {
        describe('when the transaction is valid', () => {
            it('return true', ()=>{
                expect(Transaction.validTransaction(transaction)).toBe(true);
            });
        });

        describe('when the transaction is invalid', () => {
            describe('and a transaction outputMap value is invalid', () => {
                it('return false', ()=>{
                    transaction.outputMap[senderWallet.publicKey] = -96969;
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                });
            });
            describe('and the transaction inout signature is invalid', () => {
                it('return false', ()=>{
                    transaction.input.signature = new Wallet().sign("dummy-data-sign");
                    expect(Transaction.validTransaction(transaction)).toBe(false);
                }); 
            });
            
             
        });
        
             
    });
});
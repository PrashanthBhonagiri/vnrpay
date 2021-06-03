const Transaction = require('./transaction');
const Wallet = require('./index');
const { verifySignature } = require('../util');
const { REWARD_INPUT, MINING_REWARD } = require('../config');

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

    describe('update()', () => {
        let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

        describe('and the amount is invalid', () => {
            it('throws an error', ()=>{
                expect(()=>{
                    transaction.update({senderWallet, recipient: 'foo', amount : 99999999})
                }).toThrow('Amount exceeds balance');
            });
        });

        describe('and the amout is valid', () => {
            beforeEach(() =>{
                originalSignature = transaction.input.signature;
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey];
                nextRecipient = "next-recipient";
                nextAmount = 40;
    
                transaction.update({senderWallet, recipient: nextRecipient, amount: nextAmount});
    
            });
            it('outputs the amount to the next recipient',()=>{
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount);
            });
    
            it('sutracts the amount from the original sender output amount',()=>{
                expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - nextAmount);
            });
            it('maintains a total output that matches the input amount',()=>{
                let total = Object.values(transaction.outputMap).reduce((total,outputAmount)=>total+outputAmount);
                expect(total).toEqual(transaction.input.amount);
            });
            it('re-signs the transaction',()=>{
                expect(transaction.input.sign).not.toEqual(originalSignature);
            });

            describe('and an other update for the same recipient', () => {
                let addedAmount;
                beforeEach(()=>{
                    addedAmount = 20;
                    transaction.update({senderWallet, recipient : nextRecipient, amount : addedAmount}); 
                });

                it('adds to the recipient amount',()=>{
                    expect(transaction.outputMap[nextRecipient]).toEqual(addedAmount + nextAmount);
                });

                it('subtracts the amount from the original sender output amount',()=>{
                    expect(transaction.outputMap[senderWallet.publicKey]).toEqual(originalSenderOutput - addedAmount - nextAmount);
                });
            });
            
            
        });


        
        

    });

    describe('rewardTransaction()', () => {
        let rewardTransaction, minerWallet;

        beforeEach(()=>{
            minerWallet = new Wallet();
            rewardTransaction = Transaction.rewardTransaction({
                minerWallet
            });
        });
        it('creates a transaction witht the reward input',()=>{
            expect(rewardTransaction.input).toEqual(REWARD_INPUT);
        });
        it('creates one transaction for the minner with the `mining reward`',()=>{
            expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(MINING_REWARD);
        });
    })
    
    
});

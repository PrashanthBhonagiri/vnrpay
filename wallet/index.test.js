const Wallet = require('./index');
const { verifySignature } = require('../util');
const Transaction = require('./transaction');
const Blockchain = require('../blockchain');
const { STARTING_BALANCE } = require('../config');

describe('Wallet', () => {
   let wallet;
   beforeEach(() =>{
       wallet = new Wallet();
   });
   it('has a balance',() =>{
        expect(wallet).toHaveProperty('balance');
   });
   it('has a publicKey',() =>{
        expect(wallet).toHaveProperty('publicKey');
   });

   describe('signing data', () => {
      const data = 'testing sing';

      it('verifies a signature', () =>{
         expect(
            verifySignature({
               publicKey  : wallet.publicKey,
               data,
               signature : wallet.sign(data),
            })
         ).toBe(true);
      });

      it('does not verifyan invalid signature',() =>{
         expect(
            verifySignature({
               publicKey  : wallet.publicKey,
               data,
               signature : new Wallet().sign(data),
            })
         ).toBe(false);

      });
   });
   
   describe('createTransaction()', () => {
      describe('and the amount exceeds the balanace', () => {
         it('throws an error',()=>{
            expect(() =>wallet.createTransaction({amount : 9999999, recipient : 'foo-foo'})).toThrow('Amount exceeds balance');
         });
      });
      describe('and the amount is valid', () => {
         let transaction, amount, recipient;

         beforeEach(()=>{
            amount  =  50;
            recipient  = 'foo-foo',
            transaction  = wallet.createTransaction({amount, recipient});
         });
         
         it('creates an instance of `Transaction`',()=>{
            expect( transaction instanceof Transaction).toBe(true);
         });
         it('matches the transaction input with the wallet',()=>{
            expect( transaction.input.address).toEqual(wallet.publicKey);
         });
         it('outputs the amount of the recipient',()=>{
            expect(transaction.outputMap[recipient]).toEqual(amount);
         });
      });
      describe('and a chain is passed', () => {
         it('calls `wallet.calculateBalance`',()=>{
            const calculateBalanceMonk = jest.fn();

            const originalCalculateBalance = Wallet.calculateBalance;

            Wallet.calculateBalance = calculateBalanceMonk;
            wallet.createTransaction({
               recipient : 'foo-user',
               amount : 50,
               chain :new Blockchain().chain,
            });
            expect(calculateBalanceMonk).toHaveBeenCalled();

            Wallet.calculateBalance = originalCalculateBalance;
         });
      });
      
      
   });

   describe('calculateBalance()', () => {
      let blockchain;

      beforeEach(()=>{
         blockchain = new Blockchain();
      });

      describe('and there are no outputs for the wallet', () => {
         it('returns the `STARTING_BALANCE`',()=>{
            expect(Wallet.calculateBalance({
               chain : blockchain.chain,
               address : wallet.publicKey
            })).toEqual(STARTING_BALANCE);
         });
      });

      describe('and there are outputs for the wallets', () => {
         let transaction1, transaction2;

         beforeEach(()=>{
            transaction1 = new Wallet().createTransaction({
               recipient : wallet.publicKey,
               amount : 50,
            });
            transaction2 = new Wallet().createTransaction({
               recipient : wallet.publicKey,
               amount : 160,
            });
            
            blockchain.addBlock({
               data : [transaction1, transaction2],
            });

         });
         it('adds the sum of all outputs to the wallet balance',()=>{
            expect(
               Wallet.calculateBalance({
                  chain : blockchain.chain,
                  address : wallet.publicKey
               })
            ).toEqual(
               STARTING_BALANCE +
               transaction1.outputMap[wallet.publicKey] + 
               transaction2.outputMap[wallet.publicKey]
               )
         });
         describe('and the wallet has made a transaction', () => {
            let recentTransaction;

            beforeEach(()=>{
               recentTransaction = wallet.createTransaction({
                  recipient : 'foo',
                  amount : 15,
               });
               blockchain.addBlock({data : [recentTransaction]});

            });
            it('returns the output amount of the recent transaction',()=>{
               expect(
                  Wallet.calculateBalance({
                     chain : blockchain.chain,
                     address : wallet.publicKey
                  })
               ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
            });
            describe('and there are outputs next to and after recent transaction', () => {
               let sameBlockTransaction, nextBlockTransaction;

               beforeEach(()=>{
                  recentTransaction = wallet.createTransaction({
                     recipient : 'later-foo-user',
                     amount : 60
                  });

                  sameBlockTransaction = Transaction.rewardTransaction({minerWallet : wallet});

                  blockchain.addBlock({data : [recentTransaction, sameBlockTransaction]});

                  nextBlockTransaction = new Wallet().createTransaction({
                     recipient : wallet.publicKey,
                     amount : 120,
                  });

                  blockchain.addBlock({data : [nextBlockTransaction]});

               });
               it('includes the output amounts in returned balance',()=>{
                  expect(
                     Wallet.calculateBalance({
                        chain : blockchain.chain,
                        address : wallet.publicKey
                     })
                  ).toEqual(
                     recentTransaction.outputMap[wallet.publicKey] + 
                     sameBlockTransaction.outputMap[wallet.publicKey] + 
                     nextBlockTransaction.outputMap[wallet.publicKey]
                  );
               });
            });
            
         });
         
      });
   });
});

const PubNub = require('pubnub');
require('dotenv').config();

const credentials = {
    publishKey : process.env.publishKey,
    subscribeKey : process.env.subscribeKey,
    secretKey : process.env.secretKey
};

const CHANNELS = {
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
};

class PubSub {
    constructor({ blockchain, transactionPool, wallet }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;

        this.pubnub = new PubNub(credentials);
        
        this.pubnub.subscribe({channels : Object.values(CHANNELS) });
    
        this.pubnub.addListener(this.listener());

    };

    broadcastChain() {
        this.publish({
          channel: CHANNELS.BLOCKCHAIN,
          message: JSON.stringify(this.blockchain.chain)
        });
    };

    broadcastTransaction( transaction ) {
        this.publish({
            channel : CHANNELS.TRANSACTION,
            message : JSON.stringify(transaction),
        });
    };

    listener() {
        return {
            message : (messageObject) => {
                const { channel, message } = messageObject;
                console.log(`Message received . Channel ${channel}. Mesasge ${message}`);

                const parsedMessage = JSON.parse(message);

                if(channel === CHANNELS.BLOCKCHAIN) {
                    console.log("calling replace from pubsub listener");
                    this.blockchain.replaceChain(parsedMessage,()=>{
                        this.transactionPool.clearBlockchainTransactions({chain :parsedMessage
                        });
                    });
                }
                else if( channel === CHANNELS.TRANSACTION ) {
                    if(!this.transactionPool.existingTransaction({inputAddress : this.wallet.publicKey})) {
                        this.transactionPool.setTransaction(parsedMessage);
                    }
                }
                
            }
        }
    }

    publish({channel, message}) {
        this.pubnub.publish({channel, message});
    }
}

module.exports = PubSub;
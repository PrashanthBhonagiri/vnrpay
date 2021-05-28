const PubNub = require('pubnub');
// require('dotenv').config();

const credentials = {
    publishKey : process.env.publishKey,
    subscribeKey : process.env.subscribeKey,
    secretKey : process.env.secretKey
};

const CHANNELS = {
    test : "test",
};

class PubSub {
    constructor() {
        this.pubnub = new PubNub(credentials);
        
        this.pubnub.subscribe({channels : Object.values(CHANNELS) });
    
        this.pubnub.addListener(this.listener());

    };

    listener() {
        return {
            message : (messageObject) => {
                const { channel, message } = messageObject;
                console.log(`Message received . Channel ${channel}. Mesasge ${message}`);
            }
        }
    }

    publish({channel, message}) {
        this.pubnub.publish({channel, message});
    }
}

// const d = new PubSub();

// d.publish({
//     channel : CHANNELS.test,
//     message : "sadf",
// });
module.exports = PubSub;
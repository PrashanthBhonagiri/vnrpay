import React from 'react';

const Transaction = ({transaction}) => {
    const {input, outputMap } = transaction ;

    const recipients = Object.keys(outputMap);

    return (
        <div className='Transaction'>
            <div>
                From : {`${input.address.substring(0,20)}...`}
                <br />
                Balance : {input.amount || `System Reward`}
            </div>
            {
                recipients.map(recipient =>(
                    <div key={recipient}>
                        T0 : {`${recipient.substring(0,20)}...`}
                        <br />
                        Sent : {outputMap[recipient]}
                    </div>
                ))
            }
        </div>
    )
}
export default Transaction;
import React, { Component } from 'react';
import { FormGroup, FormControl, Button } from 'react-bootstrap';

import { Link } from 'react-router-dom';
import history from '../history';

class ConductTransaction extends Component {
    state = {recipient : '', amount : 0};
    updateRecipient = event =>{
       this.setState({recipient : event.target.value}); 
    };
    updateAmount = event =>{
        this.setState({amount : Number(event.target.value) }); 
    };
    conductTransaction = () =>{
        const { recipient, amount }  = this.state;
        
        fetch(`${document.location.origin}/api/transact`,{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({
                recipient, 
                amount
            })
        })
            .then((response) => response.json())
            .then((res)=>{
                console.log(res);
                alert(res.status);
                history.push('/transaction-pool');
            });

    }
    render(){
        // console.log("this.state = " ,this.state);
        return (
            <div className="conductTransaction">
                <Link to="/">Home</Link>
                <h3>Conduct a Transaction</h3>
                <div>
                    <FormGroup>
                        <FormControl
                            input="text"
                            placeholder = "Enter Recipient Address(PublicKey)"
                            value = {this.state.recipient}
                            onChange = {this.updateRecipient}
                        >
                        </FormControl>
                    </FormGroup>
                    <FormGroup>
                    <FormControl
                            input="number"
                            placeholder = "Enter Amount to Transfer"
                            value = {this.state.amount}
                            onChange = {this.updateAmount}
                    >
                    </FormControl>

                    </FormGroup>
                    <div>
                        <Button 
                            variant="danger"
                            onClick={this.conductTransaction}
                        >Submit</Button>
                    </div>
                </div>
            </div>
        )
    }
};

export default ConductTransaction;

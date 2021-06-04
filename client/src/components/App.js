import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';

class App extends Component {
    state = {  walletInfo: {}};

    componentDidMount() {
        fetch(`${document.location.origin}/api/wallet-info`)
            .then(response => response.json())
            .then((res)=>{
                console.log(res);
                this.setState({walletInfo :res })
            });
    };

    render() {
        const { address, balance } = this.state.walletInfo;
        return (
            <div className='App'>
                <img className='logo' src={logo}></img>
                <br />
                <div>
                    Welcome to VNRPAY 
                </div>
                <br />
                <div>
                    <NavLink to='/blocks'>
                        Blocks
                    </NavLink>
                </div>
                
                <div>
                    <NavLink to='/conduct-transaction'>
                    Conduct a Transaction
                    </NavLink>
                </div>
                
                <div>
                    <NavLink to='/transaction-pool'>
                        TransactionPool
                    </NavLink>
                </div>
                <br />
                <div className="WalletInfo">
                <div>Address : {address}</div>
                <div>Balance : {balance}</div>
                </div>
            </div>
        );
    }
}

export default App;
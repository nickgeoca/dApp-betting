import React, { Component } from "react";
import OilPriceBetContract from "./contracts/OilPriceBet.json";
import getWeb3 from "./utils/getWeb3";

import "./App.css";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = OilPriceBetContract.networks[networkId];
      const instance = new web3.eth.Contract(
        OilPriceBetContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.getValues);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };


  betAbove = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.placeBet(true).send({from: accounts[0], value: 10**16});
  };

  betBelow = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.placeBet(false).send({from: accounts[0], value: 10**16});
  };

  collectWinnings = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.collectWinnings().send({from: accounts[0]});
  };

  getValues = async () => {
    const { accounts, contract } = this.state;

    const strikePrice = ((await contract.methods.strikePrice().call()) / 1000).toString(10);
    this.setState({ strikePrice: strikePrice });

    let userBet = (await contract.methods.userBet(accounts[0]).call()).toString(10);
    userBet = userBet === '0'? "Have not betted"
            : userBet === '1'? "You bet .01 ether that the final price will be above $" + strikePrice
            : userBet === '2'? "You bet .01 ether that the final price will be above $" + strikePrice
            :                  '?';
    this.setState({ userBet: userBet });

    this.setState({ contractAddress: contract._address });

    let didWin = await contract.methods.didUserWin(accounts[0]).call();
    let outcomePrice = (await contract.methods.outcomePrice().call()).toString(10);
    didWin = didWin? 'You have won!': (outcomePrice==='0'? 'Waiting for outcome...': 'Better luck nextime!');
    console.log(await contract.methods.userCollectedWinings(accounts[0]).call());
    didWin = (await contract.methods.userCollectedWinings(accounts[0]).call())? 'Winnings collected!' : didWin;
    this.setState({ userDidWin: didWin})

    if (outcomePrice !== '0') this.setState({ finalPrice: 'Final Price of Oil $' + outcomePrice / 1000})
    else this.setState({ finalPrice: ''})
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Toy Gambling dApp - Place Your Wager!</h1>
        <h4>Is oil going to be above ${this.state.strikePrice} by the end of the presentation? </h4>
        <h5><a href="https://www.theice.com/products/219/Brent-Crude-Futures/data?marketId=222470">See current price here</a></h5>
        <hr/>
        <button onClick={this.betAbove}>
        Bet Final Price is Higher
        </button>
        <button onClick={this.betBelow}>
        Bet Final Price is Lower
        </button>
      
        <div>{this.state.userBet}</div>
        <hr/>
        <ul><h2>Ethereum Testnet Explorer</h2>
        <li><a href={"https://rinkeby.etherscan.io/address/"+this.state.contractAddress}>Betting Smart Contract</a></li>
        <li><a href={"https://rinkeby.etherscan.io/address/"+this.state.accounts[0]}>Your Address</a></li>
        </ul>
        <hr/>
        
      {this.state.userDidWin}<br/>{this.state.finalPrice}
        <button onClick={this.collectWinnings}>
        Collect Winnings
        </button>
       
      </div>
    );
  }
}

export default App;

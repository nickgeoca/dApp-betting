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

    let outcomePrice = (await contract.methods.outcomePrice().call()).toString(10);
    outcomePrice = outcomePrice === '0'? 'outcome not set': outcomePrice;
    this.setState({ outcomePrice: outcomePrice });
    console.log(await contract.methods.strikePrice().call());
    const strikePrice = ((await contract.methods.strikePrice().call()) / 1000).toString(10);
    this.setState({ strikePrice: strikePrice });

    let userBet = (await contract.methods.userBet(accounts[0]).call()).toString(10);
    userBet = userBet === '0'? "Have not betted"
            : userBet === '1'? "You bet .01 ether that the outcome price will go low"
            : userBet === '2'? "You bet .01 ether that the outcome price will go high"
            :                  '?';
    this.setState({ userBet: userBet });

    console.log(contract);
    this.setState({ contractAddress: contract._address });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Toy Gambling dApp - Place Your Wager!</h1>
        <h4>Is oil going to be above {this.state.strikePrice} by the end of the presentation? </h4>
        <h5><a href="https://www.theice.com/products/219/Brent-Crude-Futures/data?marketId=222470">See current price here</a></h5>

        <button onClick={this.betAbove}>
        Bet Price Goes Up
        </button>
        <button onClick={this.betBelow}>
        Bet Price Goes Down
        </button>
        <button onClick={this.collectWinnings}>
        Collect Winnings
        </button>
      
        <div>{this.state.userBet}</div>
        <div>Strike price: {this.state.strikePrice}</div>

      <a href={"https://rinkeby.etherscan.io/address/"+this.state.contractAddress}>Betting Smart Contract</a>
      <a href={"https://rinkeby.etherscan.io/address/"+this.state.accounts[0]}>Your address</a>
      </div>
    );
  }
}

export default App;

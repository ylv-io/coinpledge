import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import './../css/index.css'
import CoinPledgeContract from '../../build/contracts/CoinPledge.json'

const contract = require('truffle-contract')

class App extends React.Component {
  constructor(props){
    super(props)

    this.createChallenge = this.createChallenge.bind(this);

    this.state = {
    }

    if(typeof web3 != 'undefined') {
        console.log("Using web3 detected from external source like Metamask")
        this.web3 = new Web3(web3.currentProvider)
    } else {
        console.log("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        this.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
    }

    // Using truffle-contract we create the coinpledge object.
    const coin = contract(CoinPledgeContract);
    coin.setProvider(this.web3.currentProvider);

    const self = this;

    // Find contract instance on blockchain and bind
    coin.deployed().then(function(instance) {
      self.state.coin = instance;
    })
    .then(function(result) {

    });

  }

  componentDidMount() {
    this.updateState()

    setInterval(this.updateState.bind(this), 7e3)
  }

  updateState() {
  }

  createChallenge(e) {
    e.preventDefault();


    this.state.coin.createChallenge("ylv", web3.eth.accounts[0], 120, {
        gas: 300000,
        from: web3.eth.accounts[0],
        value: web3.toWei(0.1, 'ether')
      })
      .then(function(result) {
        // If this callback is called, the transaction was successfully processed.
        alert("Transaction successful!")
      }).catch(function(e) {
        // There was an error! Handle it.
      });
  }

  render(){
    return (
        <div>
          <h1>Hello</h1>
          <form onSubmit={this.createChallenge}>
              <input type="text" name="name"/>
              <button>Create Challenge</button>
          </form>
        </div>
    )
  }
}

ReactDOM.render(
   <App />,
   document.querySelector('#root')
)
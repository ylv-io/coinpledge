import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import _ from 'underscore'

import './../css/index.css'

import CoinPledgeContract from '../../build/contracts/CoinPledge.json'

const contract = require('truffle-contract')

class App extends React.Component {
  constructor(props){
    super(props)

    this.createChallenge = this.createChallenge.bind(this);

    this.state = {
      challenges: []
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

    // Find contract instance on blockchain and bind
    coin.deployed().then((instance) => {
      this.state.coin = instance;

      //check number of challenges
      instance.ownerToChallengeCount.call(web3.eth.accounts[0], {
        from: web3.eth.accounts[0]
      })
      .then((result) => {
        const numberOfChallenges = result.toNumber();
        if(numberOfChallenges > 0)
          this.getAllChallenges();
      })
    });

  }

  getAllChallenges() {
    const instance = this.state.coin;
    if(instance)
    {
      return instance.getChallenges.call(web3.eth.accounts[0], {
        from: web3.eth.accounts[0]
      })
      .then((result) => {
        const promises = result.map(((o) => instance.challenges.call(o.toNumber(), {
          from: web3.eth.accounts[0]
        })));
  
        return Promise.all(promises);
      })
      .then((result) => {
        const challenges = result.map((o, i) => this.arrayToChallenge(o, i));
        console.log(challenges);
        this.setState((o) => {
          return {
            challenges: challenges
          }
        });
      })
      .catch(function(e) {
        console.log(e);
      });
    }
  }

  arrayToChallenge(array, id) {
    return {
      id: id,
      name: array[0],
      value: array[1],
      judge: array[2],
      startDate: array[3],
      time: array[4],
      successed: array[5],
      resolved: array[6]
    }
  }

  componentDidMount() {
    this.updateState();

    setInterval(this.updateState.bind(this), 7e3);
  }

  updateState() {
    this.getAllChallenges.bind(this)();
  }

  createChallenge(e) {
    e.preventDefault();

    this.state.coin.createChallenge("fuck society", web3.eth.accounts[0], 120, {
        gas: 300000,
        from: web3.eth.accounts[0],
        value: web3.toWei(0.1, 'ether')
      })
      .then((result) => {
        console.log(result);
      })
      .catch(function(e) {

      });
  }

  render(){
    return (
        <div>
          <h1>CoinPledge</h1>
          <form onSubmit={this.createChallenge}>
              <input type="text" name="name"/>
              <button>Create Challenge</button>
          </form>
          <h2>Your Challenges</h2>
          {this.state.challenges.map((o) => <div key={o.id}>{o.name}</div>)}
        </div>
    )
  }
}

ReactDOM.render(
   <App />,
   document.querySelector('#root')
)
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
    this.resolveChallenge = this.resolveChallenge.bind(this);

    this.state = {
      challenges: [],
      cases: [],
      bonusFund: 0
    }

    if(typeof web3 != 'undefined') {
        console.log("Using web3 detected from external source like Metamask")
        this.web3 = new Web3(web3.currentProvider)
    } else {
        console.log("No web3 detected.");
    }

    // Using truffle-contract we create the coinpledge object.
    const coin = contract(CoinPledgeContract);
    coin.setProvider(this.web3.currentProvider);

    // Find contract instance on blockchain and bind
    coin.deployed().then((instance) => {
      this.state.coin = instance;
    });

  }

  getBonusFund() {
    const coin = this.state.coin;
    if(coin) {
      return coin.getBonusFund.call(this.web3.eth.accounts[0], {
        from: this.web3.eth.accounts[0]
      })
      .then((result) => {
        const bonusFund = web3.fromWei(result.toNumber(), 'ether');
        console.log(`User has ${bonusFund} ether in bonus fund`);
        this.setState((o) => {
          return {
            bonusFund: bonusFund
          }
        });
      })
      .catch((e) => {
        console.log(e);
      });
    }
  }

  getAllCases() {
    const instance = this.state.coin;
    if(instance) {
      // check number of challenges
      instance.judgeToChallengeCount.call(web3.eth.accounts[0], {
        from: web3.eth.accounts[0]
      })
      .then((result) => {
        const numberOfCases = result.toNumber();
        console.log(`User has ${numberOfCases} cases`);
        if(numberOfCases > 0)
        // get all user cases indexes
          return instance.getCases.call(web3.eth.accounts[0], {
            from: web3.eth.accounts[0]
          });
        else return Promise.reject("User has zero cases");
      })
      .then((result) => {
        // get all users's cases objects
        const promises = result.map(((o) => instance.challenges.call(o.toNumber(), {
          from: web3.eth.accounts[0]
        })));
  
        return Promise.all(promises);
      })
      .then((result) => {
        // map all user's cases to objects
        const cases = result.map((o, i) => this.arrayToChallenge(o, i));
        console.log(`User cases:`);
        console.log(cases);
        this.setState((o) => {
          return {
            cases: cases
          }
        });
      })
      .catch(function(e) {
        console.log(e);
      });
    }
  }

  getAllChallenges() {
    const instance = this.state.coin;
    if(instance) {
      // check number of challenges
      instance.userToChallengeCount.call(web3.eth.accounts[0], {
        from: web3.eth.accounts[0]
      })
      .then((result) => {
        const numberOfChallenges = result.toNumber();
        console.log(`User has ${numberOfChallenges} challenges`);
        if(numberOfChallenges > 0)
        // get all user challenges indexes
          return instance.getChallenges.call(web3.eth.accounts[0], {
            from: web3.eth.accounts[0]
          });
        else return Promise.reject("User has zero challenges");
      })
      .then((result) => {
        // get all users's challenges objects
        const promises = result.map(((o) => instance.challenges.call(o.toNumber(), {
          from: web3.eth.accounts[0]
        })));
  
        return Promise.all(promises);
      })
      .then((result) => {
        // map all user's challenges to objects
        const challenges = result.map((o, i) => this.arrayToChallenge(o, i));
        console.log(`User challenges:`);
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
      value: web3.fromWei(array[1].toNumber(), 'ether'),
      judge: array[2],
      startDate: array[3].toNumber(),
      time: array[4].toNumber(),
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
    this.getBonusFund.bind(this)();
    this.getAllCases.bind(this)();
  }

  createChallenge(e) {
    e.preventDefault();

    const name = e.target.elements.name.value.trim();
    e.target.elements.name.value = '';

    const value = e.target.elements.value.value.trim();
    e.target.elements.name.value = '';

    const time = e.target.elements.time.value.trim();
    e.target.elements.time.value = '';

    const judge = e.target.elements.judge.value.trim();
    e.target.elements.judge.value = '';

    this.state.coin.createChallenge(name, judge, time, {
        from: web3.eth.accounts[0],
        value: web3.toWei(value, 'ether')
      })
      .then((result) => {
        console.log(result);
      })
      .catch(function(e) {
        console.log(e);
      });
  }

  resolveChallenge(e) {
    e.preventDefault();

    const id = e.target.elements.id.value.trim();
    e.target.elements.id.value = '';

    const decision = e.target.elements.decision.checked;
    e.target.elements.decision.checked = false;

    console.log(decision);

    this.state.coin.resolveChallenge(id, decision, {
      from: web3.eth.accounts[0]
    })
    .then((result) => {
      console.log(result);
    })
    .catch(function(e) {
      console.log(e);
    });

  }

  render(){
    return (
        <div>
          <h1>CoinPledge</h1>
          <h4>Your bonus fund is {this.state.bonusFund} ether</h4>
          <h4>Create Challenge</h4>
          <form onSubmit={this.createChallenge}>
              <label htmlFor="name">What?</label> <input type="text" name="name"/> <br/>
              <label htmlFor="number">How much?</label> <input type="number" step="0.01" name="value"/> <br/>
              <label htmlFor="judge">Who judge?</label> <input type="text" name="judge"/> <br/>
              <label htmlFor="time">How long?</label> <input type="number" name="time"/> <br/>
              <button>Create Challenge</button>
          </form>
          <h4>Resolve Challenge</h4>
          <form onSubmit={this.resolveChallenge}>
              <label htmlFor="id">Which challenge?</label> <input type="number" name="id"/> <br/>
              <label><input type="checkbox" value="check" name="decision"/> Is accomplished? </label> <br/>
              <button>Resolve Challenge</button>
          </form>
          <h2>Your Challenges</h2>
          {this.state.challenges.map((o) => 
              <div key={o.id}>
                <h4>{o.name}({o.id})</h4>
                <table>
                  <tbody>
                    <tr>
                      <td>Value</td>
                      <td>{o.value} ether</td>
                    </tr>
                    <tr>
                      <td>Judge</td>
                      <td>{o.judge}</td>
                    </tr>
                    <tr>
                      <td>Start Date</td>
                      <td>{o.startDate}</td>
                    </tr>
                    <tr>
                      <td>Time</td>
                      <td>{o.time} days</td>
                    </tr>
                    <tr>
                      <td>Successed</td>
                      <td>{o.successed ? "True" : "False"}</td>
                    </tr>
                    <tr>
                      <td>Resolved</td>
                      <td>{o.resolved ? "True" : "False"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          }
          <h2>Your Cases</h2>
          {this.state.cases.map((o) => 
              <div key={o.id}>
                <h4>{o.name}({o.id})</h4>
                <table>
                  <tbody>
                    <tr>
                      <td>Value</td>
                      <td>{o.value} ether</td>
                    </tr>
                    <tr>
                      <td>Judge</td>
                      <td>{o.judge}</td>
                    </tr>
                    <tr>
                      <td>Start Date</td>
                      <td>{o.startDate}</td>
                    </tr>
                    <tr>
                      <td>Time</td>
                      <td>{o.time} days</td>
                    </tr>
                    <tr>
                      <td>Successed</td>
                      <td>{o.successed ? "True" : "False"}</td>
                    </tr>
                    <tr>
                      <td>Resolved</td>
                      <td>{o.resolved ? "True" : "False"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
    )
  }
}

ReactDOM.render(
   <App />,
   document.querySelector('#root')
)
import React from 'react';
import ReactDOM from 'react-dom';
import Web3 from 'web3';
import _ from 'underscore';

import CoinPledgeContract from '../../../build/contracts/CoinPledge.json';

import Challenge from './Challenge';
import CreateChallenge from './CreateChallenge';

import Contract from 'truffle-contract';


export default class App extends React.Component {

  state = {
    challenges: [],
    cases: [],
    bonusFund: 0
  }

  constructor(props){
    super(props)

    if(typeof web3 != 'undefined') {
        console.log("Using web3 detected from external source like Metamask")
        this.web3 = new Web3(web3.currentProvider);
        this.account = this.web3.eth.accounts[0];
    } else {
        console.log("No web3 detected.");
    }

    // Using truffle-contract we create the coinpledge object.
    const coin = Contract(CoinPledgeContract);
    coin.setProvider(this.web3.currentProvider);

    // Find contract instance on blockchain and bind
    coin.deployed().then((instance) => {
      this.state.coin = instance;

      this.updateState();
    });

  }

  getBonusFund = () => {
    const coin = this.state.coin;
    if(coin) {
      return coin.getBonusFund.call(this.account, {
        from: this.account
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

  getAllCases = () => {
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

        // push indexes down the chain
        promises.push(result);
  
        return Promise.all(promises);
      })
      .then((result) => {
        //pop indexes
        const indexes = result.pop();
        // map all user's cases to objects
        const cases = result.map((o, i) => this.arrayToChallenge(o, indexes[i].toNumber()));
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

  getAllChallenges = () => {
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

        // push indexes down the chain
        promises.push(result);
  
        return Promise.all(promises);
      })
      .then((result) => {
        //pop indexes
        const indexes = result.pop();
        // map all user's challenges to objects
        const challenges = result.map((o, i) => this.arrayToChallenge(o, indexes[i].toNumber()));
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
      resolved: array[6],
      canResolve: this.account === array[2]
    }
  }

  componentDidMount() {
    setInterval(this.updateState.bind(this), 7e3);
  }

  updateState() {
    this.getAllChallenges();
    this.getBonusFund();
    this.getAllCases();
  }

  createChallenge = (e) => {
    e.preventDefault();

    const name = e.target.elements.name.value.trim();
    const value = e.target.elements.value.value.trim();
    const time = e.target.elements.time.value.trim();
    const judge = e.target.elements.judge.value.trim();

    this.state.coin.createChallenge(name, judge, time * 86400, {
        from: web3.eth.accounts[0],
        value: web3.toWei(value, 'ether')
      })
      .then((result) => {
        e.target.elements.name.value = '';
        e.target.elements.value.value = '';
        e.target.elements.time.value = '';
        e.target.elements.judge.value = '';
        console.log(result);
      })
      .catch(function(e) {
        console.log(e);
      });
  }

  getHandleResolve(id, decision) {
    return () => this.resolveChallenge(id, decision);
  }

  resolveChallenge = (id, decision) => {
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

  render () {
    return (
        <div>
          <section className="hero is-success is-bold">
            <div className="hero-body">
              <div className="container">
                <h1 className="title">CoinPledge</h1>
                <h4 className="subtitle">Archive your goals and connect with people in a meaningful way</h4>
                <hr/>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <p>
                  Your bonus fund has <strong>{this.state.bonusFund}</strong> ether. <br/>
                  Your account is <strong>{this.account}</strong>.
              </p>
            </div>
          </section>

          <section className="section">
            <div className="container">
              <div className="columns">
                <div className="column is-half box">
                  <CreateChallenge createChallenge={this.createChallenge} />
                </div>
              </div>
            </div>
          </section>
          <section className="section">
            <div className="container">
              <h4 className="title is-4">Your Challenges</h4>
              <hr/>
              { !this.state.challenges.length && <p className="title is-4">You don't have any challenges yet. Create one. You can do it!</p>}
              <div className="columns is-multiline">
                {this.state.challenges.map((o) => 
                  <div className="column is-4" key={o.id}>
                    <Challenge challenge={o} handleWin={this.getHandleResolve(o.id, true)} handleLoss={this.getHandleResolve(o.id, false)} />
                  </div>)}
              </div>
            </div>
          </section>
          <section className="section">
            <div className="container">
            <h4 className="title is-4">Your Cases</h4>
            <hr/>
            { !this.state.challenges.length && <p className="title is-4">You don't have any cases yet. Help someone!</p>}
              <div className="columns is-multiline">
                {this.state.cases.map((o) => 
                  <div className="column is-4" key={o.id}>
                    <Challenge challenge={o} handleWin={this.getHandleResolve(o.id, true)} handleLoss={this.getHandleResolve(o.id, false)} />
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>
    )
  }
}

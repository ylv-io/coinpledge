import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import _ from 'underscore'
import moment from 'moment'

import './../css/index.css'

import CoinPledgeContract from '../../build/contracts/CoinPledge.json'

const contract = require('truffle-contract')

class Challenge extends React.Component {
  render() {
    return (
      <div className="card">
        <div className="card-content">
          <p className="is-size-4">
            I pledge to "<strong>{this.props.challenge.name}</strong>" before <strong>{moment.unix(this.props.challenge.startDate).add(this.props.challenge.time, 's').format("DD MMM YYYY")}</strong> by staking <strong>{this.props.challenge.value} ether</strong>.
          </p>
        </div>
        <footer className="card-footer">
          <a href="#" className="card-footer-item">Tweet</a>
          <a href="#" className="card-footer-item">Facebook</a>
          <a href="#" className="card-footer-item">Resolve</a>
        </footer>
      </div>
    );
  }
}

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

      this.updateState();
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

    this.state.coin.createChallenge(name, judge, time * 86400, {
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
              <div className="columns">
                <div className="column is-half box">
                  <h4 className="title is-4">Create Challenge</h4>
                  <hr/>
                  <form onSubmit={this.createChallenge}>
                    <div className="field">
                      <label className="label" htmlFor="name">State your goal. Keep it short.</label>
                      <div className="control">
                        <input className="input" type="text" name="name"/>
                      </div>
                    </div>

                    <div className="field">
                      <label className="label" htmlFor="number">How much in ether? 0.1 is minimum.</label>
                      <div className="control">
                        <input className="input" type="number" step="0.01" name="value"/>
                      </div>
                    </div>

                    <div className="field">
                      <label className="label" htmlFor="judge">Who will judge challenge? Ethereum address requred.</label>
                      <div className="control">
                        <input className="input" type="text" name="judge"/>
                      </div>
                    </div>

                    <div className="field">
                      <label className="label" htmlFor="time">How long it will take in days?</label>
                      <div className="control">
                        <input className="input" type="number" name="time"/>
                      </div>
                    </div>

                    <hr/>
                    <div className="field">
                      <div className="control">
                        <button className="button is-primary">Create Challenge</button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
          <section className="section">
            <div className="container">
              <div className="columns">
                <div className="column is-half box">
                  <h4 className="title is-4">Resolve Challenge</h4>
                  <hr/>
                  <form onSubmit={this.resolveChallenge}>
                    <div className="field">
                      <label className="label" htmlFor="id">Which challenge?</label>
                      <div className="control">
                        <input className="input" type="number" name="id"/>
                      </div>
                    </div>
                    
                    <div className="field">
                      <label className="checkbox">
                        <input type="checkbox" value="check" name="decision"/> Is accomplished?
                      </label>
                    </div>
                    <hr/>
                    <div className="field">
                      <button className="button">Resolve Challenge</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
          <section className="section">
            <div className="container">
              <h4 className="title is-4">Your Challenges</h4>
              <hr/>
              <div className="columns is-multiline">
                {this.state.challenges.map((o) => 
                  <div className="column is-4" key={o.id}>
                    <Challenge challenge={o} />
                  </div>)}
              </div>
            </div>
          </section>
          <section className="section">
            <div className="container">
              <h2 className="subtitle">Your Cases</h2>
              {this.state.cases.map((o) => <Challenge challenge={o} key={o.id} />)}
            </div>
          </section>

          <section className="section">
            <div className="container">
              Your bonus fund is <strong>{this.state.bonusFund}</strong> ether
            </div>
          </section>

        </div>
    )
  }
}

ReactDOM.render(
   <App />,
   document.querySelector('#root')
)
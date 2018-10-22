import React from 'react'
import { connect } from 'react-redux';
import { BrowserRouter, Route, Switch, Link, NavLink, Redirect } from 'react-router-dom';

import Challenge from './Challenge';
import { shortAddress } from '../utils/web3';
import { getBonusFund, getChallengesForMentor, getChallengesForUser } from '../services/web3/challenge';
import { getWeb3js, getCoinContractPromise } from '../services/web3/web3';

class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      challenges: [],
      mentor: [],
      notFound: false
    }
  }

  async updateStateFromWeb3() {

    const web3js = getWeb3js();
    const isAddress = web3js.isAddress(this.props.match.params.id);
    if(!isAddress)
    {
      this.setState(() => ({notFound: true}));
      return;
    }

    let result = await getChallengesForUser(this.props.match.params.id);
    this.setState((o) => ({challenges: result}));

    result = await getChallengesForMentor(this.props.match.params.id);
    this.setState((o) => ({mentor: result}));

  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.id !== prevProps.match.params.id) {
      this.updateStateFromWeb3();
    }
  }

  componentDidMount() {
    this.updateStateFromWeb3();
  }
  
  render() {
    if(this.state.notFound)
      return <Redirect to='/404' />

    return(
      <section className="section">
        <div className="container">
          <h4 className="title is-3">User <a target="_blank" href={`https://ropsten.etherscan.io/address/${this.props.match.params.id}`}>{shortAddress(this.props.match.params.id)}</a></h4>
          <h4 className="title is-4">Challenges</h4>
          <hr/>
          { !this.state.challenges.length && <p className="title is-4">User do not have any challenges.</p>}
          <div className="columns is-multiline">
            {this.state.challenges.map((o) => 
              <div className="column is-4" key={o.id}>
                <Challenge 
                  challenge={o} 
                  />
              </div>)}
          </div>

          <h4 className="title is-4">Mentor</h4>
          <hr/>
          { !this.state.mentor.length && <p className="title is-4">You don't have any cases yet. Help someone!</p>}
          <div className="columns is-multiline">
            {this.state.mentor.map((o) => 
              <div className="column is-4" key={o.id}>
                <Challenge 
                  challenge={o} 
                />
              </div>
            )}
          </div>

        </div>
      </section>
    );
  }
}

export default User;
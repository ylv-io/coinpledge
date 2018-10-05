import React from 'react'
import { connect } from 'react-redux';
import Challenge from './Challenge';
import { shortAddress } from '../utils/web3';
import { getBonusFund, getMentor, getChallenges } from '../services/web3/challenge';

class User extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      challenges: [],
      mentor: []
    }
  }

  componentWillMount() {

    getChallenges(this.props.match.params.id).then(result => {
      this.setState((o) => ({challenges: result}));
    });

    getMentor(this.props.match.params.id).then(result => {
      this.setState((o) => ({mentor: result}));
    });

  }
  
  render() {
    return(
      <section className="section">
        <div className="container">
          <h4 className="title is-3">User {shortAddress(this.props.match.params.id)}</h4>
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
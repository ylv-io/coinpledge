import React from 'react'
import { addExpense } from '../actions/challenges';
import { connect } from 'react-redux';
import { createChallenge } from '../services/web3/challenge';

class CreateChallenge extends React.Component {
  constructor(props) {
    super(props);

  }
  createChallenge = (e) => {
    e.preventDefault();

    const name = e.target.elements.name.value.trim();
    const value = e.target.elements.value.value.trim();
    const time = e.target.elements.time.value.trim();
    const mentor = e.target.elements.mentor.value.trim();

    const target = e.target;

    createChallenge(name, value, time, mentor)
    .then((result) => {
      target.elements.name.value = '';
      target.elements.value.value = '';
      target.elements.time.value = '';
      target.elements.mentor.value = '';
    })
    .catch(function(e) {
      
    });

    // this.props.dispatch(addExpense({name, value, time, mentor}));
    // this.props.history.push('/challenges');
  };
  render() {
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-half box">
              <div>
              <h4 className="title is-4">Create Challenge</h4>
              <hr/>
              <form onSubmit={this.createChallenge}>
                <div className="field">
                  <label className="label" htmlFor="name">State your goal. Keep it short.</label>
                  <div className="control">
                    <input className="input" type="text" name="name"/>
                  </div>
                </div>
      
                <label className="label" htmlFor="number">How much in ether? 0.1 is minimum.</label>
                <div className="field has-addons">
                  <p className="control is-expanded">
                    <input className="input" type="number" step="0.01" name="value"/>
                  </p>
                  <p className="control">
                    <a className="button is-static">
                      ether
                    </a>
                  </p>
                </div>
      
                <label className="label" htmlFor="mentor">Who will resolve challenge? Ethereum address required.</label>
                <div className="field">
                  <p className="control">
                    <input className="input" type="text" name="mentor"/>
                  </p>
                </div>
      
                <label className="label" htmlFor="time">How long it will take in days?</label>
                <div className="field has-addons">
                  <p className="control is-expanded">
                    <input className="input" type="number" name="time"/>
                  </p>
                  <p className="control">
                    <a className="button is-static">
                      days
                    </a>
                  </p>
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
        </div>
      </section>
    );
  }
}

export default connect()(CreateChallenge);
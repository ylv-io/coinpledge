import React from 'react'

export default class CreateChallenge extends React.Component {
  render() {
    return (
      <div>
        <h4 className="title is-4">Create Challenge</h4>
        <hr/>
        <form onSubmit={this.props.createChallenge}>
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

          <label className="label" htmlFor="judge">Who will resolve challenge? Ethereum address required.</label>
          <div className="field">
            <p className="control">
              <input className="input" type="text" name="judge"/>
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
    );
  }
}
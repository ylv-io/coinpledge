import React from 'react';

import DonateForm from './DonateForm';

import { toWei } from '../services/web3/web3';
import { donate } from '../services/web3/challenge';

class Donate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasDonated: false,
    };
  }

  handleDonate = (e) => {
    e.preventDefault();
    donate('ylv', 'ylv.io', toWei(0.1, 'ether'));
  };

  handleSubmit = async ({ username, url, value }, { resetForm, setSubmitting, setStatus }) => {
    try {
      const result = await donate(username, url, toWei(value, 'ether'));
      setSubmitting(false);
      resetForm();
      this.setState(o => ({ hasDonated: true }));
    } catch (e) {
      console.log(e);
      setSubmitting(false);
    }
  }

  render() {
    const {
      hasDonated,
    } = this.state;
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-offset-one-quarter is-half">
              <div className="box">
                <h4 className="title is-4">Donate</h4>
                <hr />
                <DonateForm handleSubmit={this.handleSubmit} />
              </div>
              { hasDonated && (
                <article className="message is-success">
                  <div className="message-body">
                    <h5 className="title is-5">Thank you a lot! You are the best!</h5>
                    We really appreciate donations. Your name would be placed forever on blockchain and CoinPledge.
                  </div>
                </article>
              )
              }
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Donate;

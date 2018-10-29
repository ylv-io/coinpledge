import React from 'react';
import { connect } from 'react-redux';
import SetUsernameForm from './SetUsername';

import { setUsername } from '../services/web3/user';
import { getTransactionReceipt } from '../services/web3/web3';
import { setUsername as setUsernameAction } from '../actions/web3';

class Account extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
  }

  handleSubmit = async ({ username }, { resetForm, setSubmitting, setStatus }) => {
    try {
      const { props } = this;

      const result = await setUsername(username);
      setSubmitting(false);
      resetForm();

      props.dispatch(setUsernameAction(username));

      const receipt = await getTransactionReceipt(result);
    } catch (e) {
      console.log(e);
      setSubmitting(false);
    }
  }

  render() {
    const {
      account,
      username,
      bonusFund,
      users,
    } = this.props;

    return (
      <section className="section">
        <div className="container">
          <h4 className="title is-3">
            <a target="_blank" rel="noopener noreferrer" href={`https://ropsten.etherscan.io/address/${account}`}>
              { username ? `${username} (${account.substring(0, 10)})` : account.substring(0, 10) }
            </a>
          </h4>
          <hr />
          <p className="title is-4">Bonus Fund</p>
          <p className="subtitle is-5">
            { bonusFund }
            <span> ether</span>
          </p>
          <hr />

          { !username
            && (
              <div className="columns">
                <div className="column is-half">
                  <div className="box">
                    <h4 className="title is-4">Pick Username</h4>
                    <hr />
                    <SetUsernameForm handleSubmit={this.handleSubmit} users={users} />
                  </div>
                </div>
              </div>
            )
          }

        </div>
      </section>
    );
  }
}

const mapStateToProps = (state, props) => ({
  ...state.blockchain,
  users: state.users,
});

export default connect(mapStateToProps)(Account);

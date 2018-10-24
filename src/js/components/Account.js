import React from 'react';
import { connect } from 'react-redux';
import SetUsernameForm from './SetUsername';

import { setUsername } from '../services/web3/challenge';
import { getTransactionReceipt } from '../services/web3/web3';

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
      const result = await setUsername(username);
      setSubmitting(false);
      resetForm();

      // this.props.dispatch(addPendingChallenge({id: result, name: values.name, value: values.value, time: values.time.unix(), mentor: values.mentor }));

      const receipt = await getTransactionReceipt(result);
      console.log(receipt);
      // this.props.dispatch(updatePendingChallenge(result, { isConfirmed: true}));
    } catch (e) {
      console.log(e);
      setSubmitting(false);
    }
  }

  render() {
    const {
      account,
    } = this.props;

    return (
      <section className="section">
        <div className="container">
          <h4 className="title is-3"><a target="_blank" rel="noopener noreferrer" href={`https://ropsten.etherscan.io/address/${account}`}>{account ? account.substring(0, 10) : ''}</a></h4>
          <hr />

          <div className="columns">
            <div className="column is-half">
              <div className="box">
                <h4 className="title is-4">Username</h4>
                <hr />
                <SetUsernameForm handleSubmit={this.handleSubmit} />
              </div>
            </div>
          </div>

        </div>
      </section>
    );
  }
}

const mapStateToProps = (state, props) => ({
  ...state.blockchain,
});

export default connect(mapStateToProps)(Account);

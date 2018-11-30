import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import UserChallenge from './UserChallenge';
import usersSelect from '../selectors/usersSelect';
import CreateChallengeForm from './CreateChallengeForm';
import { createChallenge } from '../services/web3/challenge';
import { getTransactionReceipt, toWei } from '../services/web3/web3';
import { addPendingChallenge, updatePendingChallenge } from '../actions/pendingChallenges';


class CreateChallenge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidUpdate(prevProps) {
  }

  handleSubmit = async ({
    name,
    value,
    time,
    mentor,
    mentorFee,
  }, { resetForm, setSubmitting, setStatus }) => {
    const { props } = this;
    try {
      const result = await createChallenge(name, value, time.unix(), mentor, toWei(mentorFee, 'ether'));
      setSubmitting(false);
      resetForm();
      props.dispatch(addPendingChallenge({
        id: result,
        name,
        value,
        time: time.unix(),
        startDate: moment().unix(),
        mentor,
      }));

      const receipt = await getTransactionReceipt(result);
      props.dispatch(updatePendingChallenge(result, { isConfirmed: true }));
    } catch (e) {
      console.log(e);
      setSubmitting(false);
    }
  }

  render() {
    const { pendingChallenges, users } = this.props;
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-offset-one-quarter is-half">
              <div className="box">
                <h4 className="title is-4">New Challenge</h4>
                <hr />
                <CreateChallengeForm users={users} handleSubmit={this.handleSubmit} />
              </div>

              {
                pendingChallenges.map(o => (
                  <UserChallenge
                    key={o.id}
                    challenge={o}
                  />
                ))
              }
            </div>

          </div>
        </div>

      </section>
    );
  }
}

const mapStateToProps = (state, props) => ({
  pendingChallenges: state.pendingChallenges,
  users: usersSelect(state.users, state.blockchain.account),
});

export default connect(mapStateToProps)(CreateChallenge);

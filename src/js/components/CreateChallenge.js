import React from 'react'
import { connect } from 'react-redux';
import CreateChallengeForm from './CreateChallengeForm';
import { createChallenge } from '../services/web3/challenge';
import { getTransactionReceipt } from '../services/web3/web3';
import { addPending, updatePending } from '../actions/pending';


class CreateChallenge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    }

  }

  componentDidUpdate(prevProps) {
  }
  
  handleSubmit = async (values, { resetForm, setSubmitting, setStatus }) => {

    try {
      const result = await createChallenge(values.name, values.value, values.time.unix(), values.mentor);
      setSubmitting(false);
      resetForm();
      this.props.dispatch(addPending({id: result, name: values.name, value: values.value, time: values.time.unix(), mentor: values.mentor }));

      const receipt = await getTransactionReceipt(result);
      this.props.dispatch(updatePending(result, { isConfirmed: true}));
    }
    catch(e)
    {
      console.log(e);
      setSubmitting(false);
    }
  }

  render() {
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-half">
              <div className="box">
                <h4 className="title is-4">New Challenge</h4>
                <hr/>
                <CreateChallengeForm handleSubmit={this.handleSubmit} />
             </div>
            </div>

            <div className="column is-half">
              {this.props.pending.map((o) => 
                  <article 
                    key={o.id} 
                    className={ 
                                o.isConfirmed ?
                                "message is-success":
                                "message is-info"
                              }
                  >
                    <div className="message-header">
                      <p>
                        { 
                          o.isConfirmed ? 
                          'Challenge Confirmed':
                          'Submitting Challenge'
                        }
                      </p>
                    </div>
                    <div className="message-body">
                      <span className="is-size-4">{o.name}</span>
                    </div>
                  </article>
                )}
            </div>

          </div>
        </div>

      </section>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    pending: state.pending
  }
};

export default connect(mapStateToProps)(CreateChallenge);
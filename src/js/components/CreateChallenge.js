import React from 'react'
import { addExpense } from '../actions/challenges';
import { connect } from 'react-redux';
import { createChallenge } from '../services/web3/challenge';
import { withFormik } from 'formik';

const CreateChallengeForm = props => {
  const {
    values,
    touched,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    dirty,
  } = props;
  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="label" htmlFor="name">State your goal. Keep it short.</label>
        <div className="control">
          <input 
            id="name"
            type="text" 
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={
              errors.name && touched.name ? (
                'input is-danger'
              ) : (
                'input'
              )
            }
          />
          {errors.name && touched.name && (
              <div className="has-text-danger">{errors.name}</div>
            )}
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="number">How much in ether? 0.1 is minimum.</label>
          <div className="field has-addons">
            <p className="control is-expanded">
              <input 
                type="number" 
                step="0.01" 
                name="value"
                id="value"
                value={values.value}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  errors.value && touched.value ? (
                    'input is-danger'
                  ) : (
                    'input'
                  )
                }
              />
            </p>
            <p className="control">
              <a className="button is-static">
                ether
              </a>
            </p>
          </div>
          {errors.value && touched.value && (
            <div className="has-text-danger">{errors.value}</div>
          )}
      </div>

      <div className="field">
        <label className="label" htmlFor="mentor">Who will resolve challenge? Ethereum address required.</label>
        <div className="field">
          <p className="control">
            <input 
              type="text" 
              name="mentor"
              value={values.mentor}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                errors.mentor && touched.mentor ? (
                  'input is-danger'
                ) : (
                  'input'
                )
              }
            />
          </p>
          {errors.mentor && touched.mentor && (
            <div className="has-text-danger">{errors.mentor}</div>
          )}
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="time">How long it will take in days?</label>
        <div className="field has-addons">
          <p className="control is-expanded">
            <input 
              type="number" 
              name="time"
              value={values.time}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                errors.time && touched.time ? (
                  'input is-danger'
                ) : (
                  'input'
                )
              }
            />
          </p>
          <p className="control">
            <a className="button is-static">
              days
            </a>
          </p>
        </div>
        {errors.time && touched.time && (
          <div className="has-text-danger">{errors.time}</div>
        )}
      </div>

      <hr/>
      <div className="field">
        <div className="control">
          <button type="submit" disabled={isSubmitting} className="button is-primary">Create Challenge</button>
        </div>
      </div>

    </form>
  );
};

const CreateChallengeWrappedForm = withFormik({
  mapPropsToValues: () => ({ 
    name: '',
    value: '',
    mentor: '',
    time: ''
  }),

  // Custom sync validation
  validate: values => {
    let errors = {};
    if(!values.name) {
      errors.name = 'Required';
    }
    if(!values.value || values.value <= 0) {
      errors.value = 'Required';
    }
    if(!values.mentor) {
      errors.mentor = 'Required';
    }
    if(!values.time || values.time <= 0) {
      errors.time = 'Required';
    }
    return errors;
  },

  handleSubmit: (values, { setSubmitting }) => {

    createChallenge(values.name, values.value, values.time, values.mentor)
      .then((result) => {
      })
      .catch(function(e) {
        
      });
    setSubmitting(false);
  },

  displayName: 'CreateChallengeForm', // helps with React DevTools
})(CreateChallengeForm);


class CreateChallenge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isSuccessModelOpen: true
    }

  }
  render() {
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-half box">
              <div>
                <h4 className="title is-4">Create Challenge</h4>
                <hr/>

                <CreateChallengeWrappedForm />
              
             </div>
            </div>
          </div>
        </div>

        <div className={
          this.state.isSuccessModelOpen ?
            'modal is-active' :
            'modal'
        }>
          <div 
            className="modal-background"
            onClick={() => {this.setState(() => ({ isSuccessModelOpen: false }))}}
          ></div>
          <div className="modal-content">
            <article className="message is-success">
              <div className="message-header">
                <p>Success</p>
                <button 
                  onClick={() => {this.setState(() => ({ isSuccessModelOpen: false }))}}
                  className="delete" 
                  aria-label="delete"
                />
              </div>
              <div className="message-body">
                <span>Your challenge has been submitted to Ethereum blockchain. it may take a while for transaction to be processed.</span>
              </div>
            </article>
          </div>
          <button 
            onClick={() => {this.setState(() => ({ isSuccessModelOpen: false }))}}
            className="modal-close is-large" 
            aria-label="close"
          />
        </div>

      </section>
    );
  }
}

export default connect()(CreateChallenge);
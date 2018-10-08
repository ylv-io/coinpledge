import React from 'react'
import { addExpense } from '../actions/challenges';
import { connect } from 'react-redux';
import { createChallenge } from '../services/web3/challenge';
import { withFormik } from 'formik';

import moment from 'moment';
import { SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

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
    setFieldValue,
    setFieldTouched,
    dirty,
  } = props;
  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="label" htmlFor="name">Goal</label>
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
        <label className="label" htmlFor="number">Amount</label>
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
        <label className="label" htmlFor="mentor">Mentor</label>
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

      <DatePicker
        value={values.time}
        onChange={setFieldValue}
        onBlur={setFieldTouched}
        error={errors.time}
        touched={touched.time}
      />

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
    time: moment().add(7, 'days')
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
    else if(values.value < 0.1)
      errors.value = 'Mininum amount is 0.1 eth';
    
    if(!values.mentor) {
      errors.mentor = 'Required';
    }
    if(!values.time || values.time <= 0) {
      errors.time = 'Required';
    }
    return errors;
  },

  handleSubmit: (values, { resetForm, setSubmitting, setStatus }) => {

    createChallenge(values.name, values.value, values.time.unix(), values.mentor)
      .then((result) => {
      })
      .catch(function(e) {
        
      });
    setSubmitting(false);
    resetForm();
    setStatus({ success: true });
  },

  displayName: 'CreateChallengeForm', // helps with React DevTools
})(CreateChallengeForm);

class DatePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      calendarFocused: false
    };
  }
  
  handleChange = value => {
    this.props.onChange('time', value);
  };
  onFocusChange = ({focused}) => {
    this.setState(() => ({calendarFocused: focused}));
    if(!focused)
      this.props.onBlur('time', true);
  };

  render() {
    return (
      <div className="field">
        <label className="label" htmlFor="time">Deadline</label>
        <div className="control">
          <SingleDatePicker 
            date={this.props.value}
            onDateChange={this.handleChange}
            focused={this.state.calendarFocused}
            onFocusChange={this.onFocusChange}
            numberOfMonths={1}
          />
        </div>
        {!!this.props.error &&
          this.props.touched && (
            <div className="has-text-danger">{this.props.error}</div>
          )}
      </div>
    );
  }
}


class CreateChallenge extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isSuccessModalOpen: false
    }

  }
  componentDidUpdate(prevProps) {
    console.log('prevProps');
    const { success: isSuccess = false } = this.props.status || {};
    if (isSuccess) {
      this.setState(() => ({isSuccessModalOpen: true}));
    }
  }

  closeIsSuccessModal = () => {
    this.setState(() => ({ isSuccessModalOpen: false }));
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
          this.state.isSuccessModalOpen ?
            'modal is-active' :
            'modal'
        }>
          <div 
            className="modal-background"
            onClick={this.closeIsSuccessModal}
          ></div>
          <div className="modal-content">
            <article className="message is-success">
              <div className="message-header">
                <p>Success</p>
                <button 
                  onClick={this.closeIsSuccessModal}
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
            onClick={this.closeIsSuccessModal}
            className="modal-close is-large" 
            aria-label="close"
          />
        </div>

      </section>
    );
  }
}

export default connect()(CreateChallenge);
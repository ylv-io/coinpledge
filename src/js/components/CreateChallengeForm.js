import React from 'react'
import { connect } from 'react-redux';
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
        <div className="notification">
          Goal has to be specific. Good example "100 pull ups", bad example "be more healthy". Keep it short.
        </div>
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
      
      <hr/>
      
      <div className="field">
        <div className="notification">
          Amount to stake. 7 cappuccinos is a good stake.
        </div>
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

      <hr/>

      <div className="field">
        <div className="notification">
        Ethereum address. A person to resolve your challenge and keep you accountable.
        </div>
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

      <hr/>

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
          <button type="submit" disabled={isSubmitting} className="button is-primary is-fullwidth">Do It</button>
        </div>
      </div>

    </form>
  );
};

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
        <div className="notification">
          A date before which your goal has to be reached.
        </div>
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

export default withFormik({
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

  handleSubmit: (values, bag) => {
    bag.props.handleSubmit(values, bag);
  },

  displayName: 'CreateChallengeForm', // helps with React DevTools
})(CreateChallengeForm);
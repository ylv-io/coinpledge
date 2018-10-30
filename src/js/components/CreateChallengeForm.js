import React from 'react';
import { connect } from 'react-redux';
import { withFormik } from 'formik';

import moment from 'moment';

import DatePickerField from './DatePickerField';
import SelectField from './SelectField';

class CreateChallengeForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  render() {
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
      users,
    } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <div className="field">
          <div className="notification">
            Goal has to be specific and measurable. Good example &quot;100 pull ups&quot;, bad example &quot;be more healthy&quot;. Keep it short.
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
            {
              errors.name && touched.name && (
                <div className="has-text-danger">{errors.name}</div>
              )
          }
          </div>
        </div>

        <hr />

        <div className="field">
          <div className="notification">
            Amount to stake. 7 cappuccinos is a good stake.
          </div>
          <label className="label" htmlFor="value">Stake</label>
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

        <hr />
        <SelectField
          value={values.mentor}
          onChange={setFieldValue}
          onBlur={setFieldTouched}
          error={errors.mentor}
          touched={touched.touched}
          options={users}
        />

        <hr />
        <div className="field">
          <div className="notification">
            Paid out of the staked amount. There is 10% service fee.
          </div>
          <label className="label" htmlFor="mentorFee">Mentor Reward</label>
          <div className="field has-addons">
            <p className="control is-expanded">
              <input
                type="number"
                step="0.01"
                name="mentorFee"
                id="mentorFee"
                value={values.mentorFee}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                    errors.mentorFee && touched.mentorFee ? (
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
          {errors.mentorFee && touched.mentorFee && (
          <div className="has-text-danger">{errors.mentorFee}</div>
          )}
        </div>

        <hr />
        <DatePickerField
          value={values.time}
          onChange={setFieldValue}
          onBlur={setFieldTouched}
          error={errors.time}
          touched={touched.time}
        />

        <hr />
        <div className="field">
          <div className="control">
            <button type="submit" disabled={isSubmitting} className="button is-primary is-fullwidth">Do It</button>
          </div>
        </div>

      </form>
    );
  }
}

export default withFormik({
  mapPropsToValues: () => ({
    name: '',
    value: '',
    mentor: '',
    mentorFee: '',
    time: moment().add(7, 'days'),
  }),

  // Custom sync validation
  validate: (values) => {
    const errors = {};
    if (!values.name) {
      errors.name = 'Required';
    }

    if (values.value <= 0) {
      errors.value = 'Required';
    } else if (values.value < 0.1) { errors.value = 'Mininum amount is 0.1 eth'; }

    if (!values.mentor) {
      errors.mentor = 'Required';
    }

    if (values.mentorFee === '' || values.mentorFee < 0) {
      errors.mentorFee = 'Required';
    } else if (values.mentorFee > values.value) {
      errors.mentorFee = 'Should be equal or less than stake';
    }

    if (!values.time || values.time <= 0) {
      errors.time = 'Required';
    }
    return errors;
  },

  handleSubmit: (values, bag) => {
    bag.props.handleSubmit(values, bag);
  },

  displayName: 'CreateChallengeForm', // helps with React DevTools
})(CreateChallengeForm);

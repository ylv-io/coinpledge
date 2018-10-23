import React from 'react';
import { withFormik } from 'formik';

const SetUsernameForm = (props) => {
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
          Public username. Has to be within [3, 32] characters. Can&apos;t be changed.
        </div>
        <label className="label" htmlFor="name">Username</label>
        <div className="control">
          <input
            id="username"
            type="text"
            name="username"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            className={
              errors.username && touched.username ? (
                'input is-danger'
              ) : (
                'input'
              )
            }
          />
          {errors.username && touched.username && (
            <div className="has-text-danger">{errors.username}</div>
          )}
        </div>
      </div>
      <hr />
      <div className="field">
        <div className="control">
          <button type="submit" disabled={isSubmitting} className="button is-primary is-fullwidth">Set Username</button>
        </div>
      </div>

    </form>
  );
};

export default withFormik({
  mapPropsToValues: () => ({
    username: '',
  }),

  // Custom sync validation
  validate: (values) => {
    const errors = {};

    if (!values.username) {
      errors.username = 'Required';
    } else if ((values.username.length) < 3 || (values.username.length > 32)) {
      errors.username = 'Has to be within [3, 32]';
    } else if (!/^[a-zA-Z\.]+$/.test(values.username)) {
      errors.username = 'Can contain only letters and dot';
    }
    return errors;
  },

  handleSubmit: (values, bag) => {
    bag.props.handleSubmit(values, bag);
  },

  displayName: 'SetUsernameForm', // helps with React DevTools
})(SetUsernameForm);

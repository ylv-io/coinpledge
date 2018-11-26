import React from 'react';
import { withFormik } from 'formik';

const DonateForm = (props) => {
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
        <label className="label" htmlFor="name">Name</label>
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

      <div className="field">
        <label className="label" htmlFor="name">URL</label>
        <div className="control">
          <input
            id="url"
            type="text"
            name="url"
            value={values.url}
            onChange={handleChange}
            onBlur={handleBlur}
            className={
              errors.url && touched.url ? (
                'input is-danger'
              ) : (
                'input'
              )
            }
          />
          {errors.url && touched.url && (
            <div className="has-text-danger">{errors.url}</div>
          )}
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="value">Amount</label>
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
      <div className="field">
        <div className="control">
          <button type="submit" disabled={isSubmitting} className="button is-primary is-fullwidth">Donate</button>
        </div>
      </div>

    </form>
  );
};

export default withFormik({
  enableReinitialize: true,
  mapPropsToValues: ({ users }) => ({
    username: '',
    value: '',
    url: '',
  }),

  validate: (values, bag) => {
    const errors = {};

    if (!values.url) {
      errors.url = 'Required';
    }

    if (!values.username) {
      errors.username = 'Required';
    }

    if (values.value <= 0) {
      errors.value = 'Required';
    } else if (values.value < 0.1) { errors.value = 'Mininum amount is 0.1 eth'; }

    return errors;
  },

  handleSubmit: (values, bag) => {
    bag.props.handleSubmit(values, bag);
  },

  displayName: 'DonateForm', // helps with React DevTools
})(DonateForm);

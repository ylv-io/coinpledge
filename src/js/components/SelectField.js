import React from 'react';

import Select from 'react-select';

export default class SelectField extends React.Component {
  handleChange = (value) => {
    const { onChange } = this.props;
    onChange('mentor', value.value);
  };

  handleBlur = () => {
    const { onBlur } = this.props;
    onBlur('mentor', true);
  };

  render() {
    const {
      value,
      error,
      touched,
      options,
    } = this.props;
    const { handleChange, handleBlur, onFocusChange } = this;

    return (
      <div className="field">
        <div className="notification">
        A person to resolve your challenge and keep you accountable.
        </div>
        <label className="label" htmlFor="mentor">Mentor</label>
        <div className="control">
          <Select
            name="mentor"
            value={value ? options.find(option => option.value === value) : ''}
            onChange={handleChange}
            onBlur={handleBlur}
            options={options}
          />
          {error && touched && (
            <div className="has-text-danger">{error}</div>
          )}
        </div>
      </div>
    );
  }
}

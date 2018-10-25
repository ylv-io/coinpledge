import React from 'react';

import { SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

export default class DatePickerField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      calendarFocused: false,
    };
  }

  handleChange = (value) => {
    const { props } = this;
    props.onChange('time', value);
  };

  onFocusChange = ({ focused }) => {
    const { props } = this;
    this.setState(() => ({ calendarFocused: focused }));
    if (!focused) props.onBlur('time', true);
  };

  render() {
    const { value, error, touched } = this.props;
    const { handleChange, onFocusChange } = this;
    const { calendarFocused } = this.state;

    return (
      <div className="field">
        <div className="notification">
          A date before which your goal has to be reached.
        </div>
        <label className="label" htmlFor="time">Deadline</label>
        <div className="control">
          <SingleDatePicker
            date={value}
            onDateChange={handleChange}
            focused={calendarFocused}
            onFocusChange={onFocusChange}
            numberOfMonths={1}
          />
        </div>
        {!!error
          && touched && (
            <div className="has-text-danger">{error}</div>
        )}
      </div>
    );
  }
}

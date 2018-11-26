import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import getDonations from '../selectors/donations';

class Donations extends React.Component {
  handleSubmit = async ({ username, url, value }, { resetForm, setSubmitting, setStatus }) => {
  }

  render() {
    const { donations } = this.props;
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column is-offset-one-quarter is-half">
              <h4 className="title is-4">Donations</h4>
              <hr />
              {
                donations.map(o => (
                  <div
                    className="box"
                    key={o.timestamp}
                  >
                    <a target="_blank" rel="noopener noreferrer" href={o.url}>{o.name}</a>
                    <span> has donated </span>
                    <strong>{o.value}</strong>
                    <span> ether at </span>
                    {moment.unix(o.timestamp).format('DD MMM YYYY')}
                  </div>
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
  donations: getDonations(state.donations),
});

export default connect(mapStateToProps)(Donations);

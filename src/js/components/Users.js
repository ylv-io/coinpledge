import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

const Users = (props) => {
  const { users } = props;

  return (
    <section className="section">
      <div className="container content">
        <h4 className="title is-4">Users</h4>
        <hr />
        <ul>
          {
            users.map(o => (
              <li key={o.addr}>
                <Link to={`/${o.addr}`}>{o.username}</Link>
              </li>
            ))
          }
        </ul>
      </div>
    </section>
  );
};

const mapStateToProps = (state, props) => ({
  users: state.users,
});

export default connect(mapStateToProps)(Users);

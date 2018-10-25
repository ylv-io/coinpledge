import React from 'react';

import {
  Link,
} from 'react-router-dom';

const Landing = () => (
  <section className="section">
    <div className="container">

      <h1 className="title has-text-centered">What Is It?</h1>
      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <p>
            <strong>Coinpledge </strong>
            a is personal productivity tool based on
            <strong> publicity </strong>
            and
            <strong> commitment </strong>
            principles. It helps to
            <strong> clarify </strong>
            your goals and increase their
            <strong> success </strong>
            rate.
          </p>
        </div>
      </div>
      <hr />

      <h1 className="title has-text-centered">How It Works?</h1>
      <div className="container has-text-centered">
        <ul className="steps is-narrow is-large is-centered has-content-centered">
          <li className="steps-segment">
            <a href="#" className="has-text-dark">
              <span className="steps-marker">
                <span className="icon">
                  <i className="fa fa-check" />
                </span>
              </span>
              <div className="steps-content">
                <p className="is-size-4">New Challenge</p>
                <p className="is-size-6">Set your goal, stake, mentor and deadline.</p>
              </div>
            </a>
          </li>
          <li className="steps-segment">
            <a href="#" className="has-text-dark">
              <span className="steps-marker">
                <span className="icon">
                  <i className="fa fa-tasks" />
                </span>
              </span>
              <div className="steps-content">
                <p className="is-size-4">Do It</p>
                <p className="is-size-6">Execute your plan before the deadline.</p>
              </div>
            </a>
          </li>
          <li className="steps-segment">
            <span className="steps-marker">
              <span className="icon">
                <i className="fa fa-trophy" />
              </span>
            </span>
            <div className="steps-content">
              <p className="is-size-4">Success</p>
              <p className="is-size-6">Get your ETH back and enjoy your success.</p>
            </div>
          </li>
        </ul>
      </div>
      <hr />

      <h1 className="title has-text-centered">Why to Use?</h1>
      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <p>
            Humans are funny creations. We care so much about the opinion of other people,
            that it dramatically improves our chances to succeed at something if we make it public.
            <a href="https://en.wikipedia.org/wiki/Loss_aversion"> Loss aversion </a>
            means people would rather not lose $5 than gain $5.
            By staking ETH on your goal, you force loss aversion to work for you.
            <strong> Coinpledge </strong>
            uses both principles to improve your chances to succeed at your goal.
          </p>
        </div>
      </div>
      <hr />

      <h1 className="title has-text-centered">Is My ETH Safe?</h1>
      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <p>
            <strong>Coinpledge </strong>
            is Ethereum dApp. Your ETH is managed by a
            <a href="https://gist.github.com/ylv-io/eb11f85fb938338cb10d0885024fcf7e"> smart contract </a>
            and we do not have access to your funds.
          </p>
        </div>
      </div>
      <hr />

      <h1 className="title has-text-centered">How to Use?</h1>
      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <p>
            Install
            <a target="_blank" rel="noopener noreferrer" href="https://metamask.io/"> MetaMask</a>
            , get some ETH,
            <Link to="/account"> pick a username </Link>
            and start a
            <Link to="/new"> new challenge</Link>
            .
          </p>
        </div>
      </div>
      <hr />

      <h1 className="title has-text-centered">Need Help? Need Mentor?</h1>
      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <p>
            Our
            <a href="https://t.me/ylv_public"> Telegram </a>
            group is here to help you.
          </p>
        </div>
      </div>
      <hr />

    </div>
  </section>
);

export default Landing;

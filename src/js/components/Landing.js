import React from 'react';

import {
  Link,
} from 'react-router-dom';

const Landing = () => (
  <section className="section">
    <div className="container">

      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <h1 className="title">What Is It?</h1>
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

      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <h1 className="title">How It Works?</h1>
          <ul className="steps is-vertical is-narrow is-large is-centered has-content-centered">
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
                <p className="is-size-6">Get your ether back and enjoy your success.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <br />
      <hr />

      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <h1 className="title">Why to Use?</h1>
          <p>
            Humans are funny creations. We care so much about the opinion of other people,
            that it dramatically improves our chances to succeed at something if we make it public.
            <a href="https://en.wikipedia.org/wiki/Loss_aversion"> Loss aversion </a>
            means people would rather not lose $5 than gain $5.
            By staking ether on your goal, you force loss aversion to work for you.
            <strong> Coinpledge </strong>
            uses both principles to improve your chances to succeed at your goal.
          </p>
        </div>
      </div>
      <hr />

      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <h1 className="title">Is My Ether Safe?</h1>
          <p>
            <span>Funds are safu! </span>
            <strong>Coinpledge </strong>
            is Ethereum dApp. Your ether is managed by a
            <a href="https://gist.github.com/ylv-io/eb11f85fb938338cb10d0885024fcf7e"> smart contract </a>
            and we do not have access to your funds.
          </p>
        </div>
      </div>
      <hr />

      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <h1 className="title">How to Use?</h1>
          <p>
            Install
            <a target="_blank" rel="noopener noreferrer" href="https://metamask.io/"> MetaMask</a>
            , get some ether,
            <Link to="/account"> pick a username </Link>
            and start a
            <Link to="/new"> new challenge</Link>
            .
          </p>
        </div>
      </div>
      <hr />

      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <h1 className="title">How Much Does It Cost?</h1>
          <p>
            It is
            <strong> free! </strong>
            However, we do take a 10% cut from mentor reward, so if you want to use CoinPledge absolutely for free, make sure to set mentor reward to 0.
          </p>
        </div>
      </div>
      <hr />

      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <h1 className="title">What Happens to My Stake If I Lose?</h1>
          <p>
            Your staked ether goes to your personal bonus fund. Everytime you win a challenge, you get 50% as bonus from your bonus fund. If it is less than 1 finney, you get it all back.
          </p>
        </div>
      </div>
      <hr />

      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <h1 className="title">I Need All My Ether Back Immediately!</h1>
          <p>
            Sorry, we can&apos;t help. It is a smart contract. No one controls it. You can create many fake challenges and quickly resolve them using another account. That will bring all you ether back to you, but shame will live forever on the blockchain. Ha-ha!
          </p>
        </div>
      </div>
      <hr />

      <div className="columns">
        <div className="column is-offset-one-quarter is-half">
          <h1 className="title">Need Help? Need Mentor?</h1>
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

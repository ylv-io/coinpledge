import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'bulma/css/bulma.css'
import "bulma-o-steps/bulma-steps.min.css"
import './../css/index.css';

import configureStore from './store/configureStore';

import { setAccount, setBonusFund, setLocked, setInstalled } from './actions/web3';

import { getWeb3js } from './services/web3/web3';
import startPoll from './services/web3/poll';

import AppRouter from './routers/AppRouter';

const store = configureStore();

const web3js = getWeb3js();

if(web3js)
{
  if(web3js.eth.accounts.length)
  {
    const account = web3js.eth.accounts[0];
    store.dispatch(setAccount(account));
  }
  else {
    store.dispatch(setLocked(true));
  }
}
else {
  store.dispatch(setInstalled(false));
}

// start polling data from eth blockchain
startPoll(store);

const jsx = (
  <Provider store={store}>
    <AppRouter />
  </Provider>
);

ReactDOM.render(jsx, document.querySelector('#root'));
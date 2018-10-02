import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './../css/index.css';

import App from './components/App';
import configureStore from './store/configureStore';

import { setAccount, setBonusFund } from './actions/web3';

import { getWeb3js } from './services/web3/web3';
import startPoll from './services/web3/poll';

import AppRouter from './routers/AppRouter';

const store = configureStore();

const web3js = getWeb3js();

const account = web3js.eth.accounts[0];
store.dispatch(setAccount(account));

// start polling data from eth blockchain
startPoll(store);

const jsx = (
  <Provider store={store}>
    <AppRouter />
  </Provider>
);

ReactDOM.render(jsx, document.querySelector('#root'));
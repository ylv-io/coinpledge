import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'bulma/css/bulma.css'
import "bulma-o-steps/bulma-steps.min.css"
import './../css/index.css';

import configureStore from './store/configureStore';

import startPoll from './services/web3/poll';

import AppRouter from './routers/AppRouter';

const store = configureStore();

// start polling data from eth blockchain
startPoll(store);

const jsx = (
  <Provider store={store}>
    <AppRouter />
  </Provider>
);

ReactDOM.render(jsx, document.querySelector('#root'));
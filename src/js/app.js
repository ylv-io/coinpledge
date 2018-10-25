import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import 'bulma/css/bulma.css';
import 'bulma-o-steps/bulma-steps.min.css';
import '../css/index.css';

import configureStore from './store/configureStore';

import pullData from './services/web3/pull';

import AppRouter from './routers/AppRouter';

const store = configureStore();

// pull data from web3 to init
pullData(store);

const jsx = (
  <Provider store={store}>
    <AppRouter />
  </Provider>
);

ReactDOM.render(jsx, document.querySelector('#root'));

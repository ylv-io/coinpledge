import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import './../css/index.css';

import App from './components/App';
import configureStore from './store/configureStore';

import AppRouter from './routers/AppRouter';

const store = configureStore();


const jsx = (
  <Provider store={store}>
    <AppRouter />
  </Provider>
);

ReactDOM.render(jsx, document.querySelector('#root'));
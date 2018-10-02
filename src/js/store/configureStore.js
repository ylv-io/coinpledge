import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import challengesReducer from '../reducers/challenges';
import web3Reducer from '../reducers/web3';


export default () => {

  const store = createStore(
    combineReducers({
      challenges: challengesReducer,
      blockchain: web3Reducer
    }),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  return store;
}
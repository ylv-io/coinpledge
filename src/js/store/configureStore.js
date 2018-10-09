import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import challengesReducer from '../reducers/challenges';
import web3Reducer from '../reducers/web3';
import mentorReducer from '../reducers/mentor';
import pendingReducer from '../reducers/pending';


export default () => {

  const store = createStore(
    combineReducers({
      challenges: challengesReducer,
      pending: pendingReducer,
      blockchain: web3Reducer,
      mentor: mentorReducer
    }),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  return store;
}
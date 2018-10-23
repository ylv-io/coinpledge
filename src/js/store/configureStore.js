import {
  createStore,
  combineReducers,
} from 'redux';

import challengesReducer from '../reducers/userChallenges';
import web3Reducer from '../reducers/web3';
import mentorReducer from '../reducers/mentorChallenges';
import pendingReducer from '../reducers/pendingChallenges';


export default () => {
  const store = createStore(
    combineReducers({
      userChallenges: challengesReducer,
      pendingChallenges: pendingReducer,
      blockchain: web3Reducer,
      mentorChallenges: mentorReducer,
    }),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  return store;
};

import {
  createStore,
  combineReducers,
  applyMiddleware,
} from 'redux';

import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import challengesReducer from '../reducers/userChallenges';
import web3Reducer from '../reducers/web3';
import mentorReducer from '../reducers/mentorChallenges';
import pendingReducer from '../reducers/pendingChallenges';
import usersReducer from '../reducers/users';
import donationsReducer from '../reducers/donations';

const middleware = [
  thunk,
];

export default () => {
  const store = createStore(
    combineReducers({
      userChallenges: challengesReducer,
      pendingChallenges: pendingReducer,
      blockchain: web3Reducer,
      mentorChallenges: mentorReducer,
      users: usersReducer,
      donations: donationsReducer,
    }),
    composeWithDevTools(
      applyMiddleware(...middleware),
    ),
  );

  return store;
};

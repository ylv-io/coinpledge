import { createStore, combineReducers } from 'redux';
import challengesReducer from '../reducers/challenges';


export default () => {
  const store = createStore(
    combineReducers({
      challenges: challengesReducer
    }),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  return store;
}

const challengesReducerDefaultState = [];

export default (state = challengesReducerDefaultState, action) => {
  switch (action.type) {
    case 'ADD_CHALLENGE':
      return [...state, action.challenge];
    case 'ADD_OR_UPDATE_CHALLENGES':
      return action.challenges;
    default:
      return state;
  }
};
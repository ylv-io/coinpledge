
const challengesReducerDefaultState = [];

export default (state = challengesReducerDefaultState, action) => {
  switch (action.type) {
    case 'ADD_CHALLENGE':
      return [...state, action.challenge];
    default:
      return state;
  }
};
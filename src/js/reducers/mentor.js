
const mentorReducerDefaultState = [];

export default (state = mentorReducerDefaultState, action) => {
  switch (action.type) {
    case 'ADD_OR_UPDATE_MENTOR':
      return action.mentor;
    default:
      return state;
  }
};

const mentorReducerDefaultState = [];

export default (state = mentorReducerDefaultState, action) => {
  switch (action.type) {
    case 'ADD_MENTOR_CHALLENGE':
      return [...state, action.challenge];
    case 'UPDATE_MENTOR_CHALLENGE':
      return state.map((challenge) => {
        if (challenge.id === action.id) {
          return {
            ...challenge,
            ...action.updates,
          };
        }
        return challenge;
      });
    case 'ADD_OR_UPDATE_MENTOR_CHALLENGES':
      return action.challenges.map(challenge => ({
        ...(state.find(i => i.id === challenge.id) || {}),
        ...challenge,
      }));
    default:
      return state;
  }
};

const challengesReducerDefaultState = [];

export default (state = challengesReducerDefaultState, action) => {
  switch (action.type) {
    case 'ADD_USER_CHALLENGE':
      return [...state, action.challenge];
    case 'UPDATE_USER_CHALLENGE':
      return state.map((challenge) => {
        if (challenge.id === action.id) {
          return {
            ...challenge,
            ...action.updates,
          };
        }
        return challenge;
      });
    case 'ADD_OR_UPDATE_USER_CHALLENGES':
      return action.challenges.map(challenge => ({
        ...(state.find(i => i.id === challenge.id) || {}),
        ...challenge,
      }));
    default:
      return state;
  }
};

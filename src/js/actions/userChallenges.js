export const addUserChallenge = (challenge) => ({
  type: 'ADD_USER_CHALLENGE',
  challenge
});

export const addOrUpdateUserChallenges = (challenges = []) => ({
  type: 'ADD_OR_UPDATE_USER_CHALLENGES',
  challenges
});

export const updateUserChallenge = (id, updates) => ({
  type: 'UPDATE_USER_CHALLENGE',
  id,
  updates
});
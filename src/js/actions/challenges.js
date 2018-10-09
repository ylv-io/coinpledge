export const addOrUpdateChallenges = (challenges = []) => ({
  type: 'ADD_OR_UPDATE_CHALLENGES',
  challenges
});

export const updateChallenge = (id, updates) => ({
  type: 'UPDATE_CHALLENGE',
  id,
  updates
});
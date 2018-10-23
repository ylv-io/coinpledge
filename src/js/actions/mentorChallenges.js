export const addMentorChallenge = challenge => ({
  type: 'ADD_MENTOR_CHALLENGE',
  challenge,
});

export const addOrUpdateMentorChallenges = (challenges = []) => ({
  type: 'ADD_OR_UPDATE_MENTOR_CHALLENGES',
  challenges,
});

export const updateMentorChallenge = (id, updates) => ({
  type: 'UPDATE_MENTOR_CHALLENGE',
  id,
  updates,
});

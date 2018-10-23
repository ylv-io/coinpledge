
export const addPendingChallenge = (
  {
    id = '',
    name = '',
    value = 0,
    time = 0,
    mentor = '',
    isConfirmed = false,
  } = {},
) => ({
  type: 'ADD_PENDING_CHALLENGE',
  pending: {
    id,
    name,
    value,
    time,
    mentor,
    isConfirmed,
  },
});

export const removePendingChallenge = id => ({
  type: 'REMOVE_PENDING_CHALLENGE',
  id,
});


export const updatePendingChallenge = (id, updates) => ({
  type: 'UPDATE_PENDING_CHALLENGE',
  id,
  updates,
});

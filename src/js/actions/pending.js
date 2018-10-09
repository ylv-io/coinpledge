
export const addPending = (
  {
    id = '',
    name = '', 
    value = 0, 
    time = 0, 
    mentor = '',
    isConfirmed = false
  } = {}
) => ({
  type: 'ADD_PENDING',
  pending: {
    id,
    name,
    value,
    time,
    mentor,
    isConfirmed
  }
});

export const removePending = (id) => ({
  type: 'REMOVE_PENDING',
  id
});


export const updatePending = (id, updates) => ({
  type: 'UPDATE_PENDING',
  id,
  updates
});
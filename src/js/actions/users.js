export const addOrUpdateUsers = (users = []) => ({
  type: 'ADD_OR_UPDATE_USERS',
  users,
});

export const addUser = user => ({
  type: 'ADD_USER',
  user,
});

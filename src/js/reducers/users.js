const usersDefaultState = [];

export default (state = usersDefaultState, action) => {
  switch (action.type) {
    case 'ADD_OR_UPDATE_USERS':
      return action.users.map(user => ({
        ...(state.find(i => i.addr === user.addr) || {}),
        ...user,
      }));
    default:
      return state;
  }
};

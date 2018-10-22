
const pendingReducerDefaultState = [];

export default (state = pendingReducerDefaultState, action) => {  
  switch (action.type) {
    case 'REMOVE_PENDING_CHALLENGE':
      return state.filter(o => o.id !== action.id);
    case 'ADD_PENDING_CHALLENGE':
      return [...state, action.pending];
    case 'UPDATE_PENDING_CHALLENGE':
      return state.map((pending) => {
        if (pending.id === action.id) 
          return {
            ...pending,
            ...action.updates
          }
        return pending;
      });
    default:
      return state;
  }
};
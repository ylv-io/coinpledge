
const pendingReducerDefaultState = [];

export default (state = pendingReducerDefaultState, action) => {  
  switch (action.type) {
    case 'REMOVE_PENDING':
      return state.filter(o => o.id !== action.id);
    case 'ADD_PENDING':
      return [...state, action.pending];
    case 'UPDATE_PENDING':
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
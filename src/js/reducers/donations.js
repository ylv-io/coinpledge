const donationsReducerDefaultState = [];

export default (state = donationsReducerDefaultState, action) => {
  switch (action.type) {
    case 'ADD_DONATION':
      return [...state, action.donation];
    default:
      return state;
  }
};


const web3ReducerDefaultState = {
  installed: false,
  network: '3',
  locked: false,
  account: '',
  bonusFund: 0,
};

export default (state = web3ReducerDefaultState, action) => {
  switch (action.type) {
    case 'SET_INSTALLED':
      return {
        ...state,
        installed: action.installed,
      };
    case 'SET_LOCKED':
      return {
        ...state,
        locked: action.locked,
      };
    case 'SET_NETWORK':
      return {
        ...state,
        network: action.network,
      };
    case 'SET_ACCOUNT':
      return {
        ...state,
        account: action.account,
      };
    case 'SET_BONUS_FUND':
      return {
        ...state,
        bonusFund: action.bonusFund,
      };
    case 'SET_USERNAME':
      return {
        ...state,
        username: action.username,
      };
    default:
      return state;
  }
};

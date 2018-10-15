
const web3ReducerDefaultState = {
  installed: true,
  locked: false,
  account: '',
  bonusFund: 0
}

export default (state = web3ReducerDefaultState, action) => {
  switch (action.type) {
    case 'SET_INSTALLED':
      return {
        ...state,
        installed: action.installed
      }
    case 'SET_LOCKED':
      return {
        ...state,
        locked: action.locked
      }
    case 'SET_ACCOUNT':
      return {
        ...state,
        account: action.account
      }
    case 'SET_BONUS_FUND':
      return {
        ...state,
        bonusFund: action.bonusFund
      }
    default:
      return state;
  }
}
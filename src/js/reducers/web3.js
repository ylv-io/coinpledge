
const web3ReducerDefaultState = {
  account: '',
  bonusFund: 0
}

export default (state = web3ReducerDefaultState, action) => {
  switch (action.type) {
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
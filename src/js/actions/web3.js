export const setInstalled = installed => ({
  type: 'SET_INSTALLED',
  installed,
});

export const setLocked = locked => ({
  type: 'SET_LOCKED',
  locked,
});

export const setNetwork = network => ({
  type: 'SET_NETWORK',
  network,
});

export const setAccount = account => ({
  type: 'SET_ACCOUNT',
  account,
});

export const setBonusFund = bonusFund => ({
  type: 'SET_BONUS_FUND',
  bonusFund,
});

export const setUsername = username => (dispatch) => {
  dispatch({
    type: 'SET_USERNAME',
    username,
  });
};


export const arrayToChallenge = (array, id, account) => {
  return {
    id: id,
    name: array[0],
    value: web3.fromWei(array[1].toNumber(), 'ether'),
    user: account,
    mentor: array[2],
    startDate: array[3].toNumber(),
    time: array[4].toNumber(),
    successed: array[5],
    resolved: array[6],
    canResolve: account === array[2] && !array[6],
    isMentor: account == array[2],
  }
}

export const shortAddress = (address) => {
  return address.substring(0, 10);
}
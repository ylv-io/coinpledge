
// struct Challenge {
//   string name;
//   uint value;
//   address judge;
//   uint startDate;
//   uint time;

//   bool successed;
//   bool resolved;
// }

export const arrayToChallenge = (array, id, account) => {
  const mentor = array[2];
  const resolved = array[6];
  const startDate = array[3].toNumber();
  const time = array[4].toNumber();
  const daysToJudge = 7;
  return {
    id: id,
    name: array[0],
    value: web3.fromWei(array[1].toNumber(), 'ether'),
    user: account,
    mentor: mentor,
    startDate: startDate,
    time: time,
    successed: array[5],
    resolved: resolved,
    canResolve: (account === mentor || (startDate + time + (daysToJudge * 24 * 60 * 60)) < Math.floor(Date.now() / 1000)) && !resolved,
    isMentor: account == mentor,
  }
}

export const shortAddress = (address) => {
  return address.substring(0, 10);
}
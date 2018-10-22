
//  struct Challenge {
//   address user;
//   string name;
//   uint value;
//   address mentor;
//   uint startDate;
//   uint time;

//   bool successed;
//   bool resolved;
// }

export const arrayToChallenge = (array, id, account) => {
  const user = array[0];
  const mentor = array[3];
  const resolved = array[7];
  const startDate = array[4].toNumber();
  const time = array[5].toNumber();
  const daysToMentor = 7;
  return {
    id: id,
    name: array[1],
    value: web3.fromWei(array[2].toNumber(), 'ether'),
    user: user,
    mentor: mentor,
    startDate: startDate,
    time: time,
    successed: array[6],
    resolved: resolved,
    canResolve: (account === mentor || (startDate + time + (daysToMentor * 24 * 60 * 60)) < Math.floor(Date.now() / 1000)) && !resolved,
    isMentor: user == mentor,
  }
}

export const shortAddress = (address) => {
  return address.substring(0, 10);
}
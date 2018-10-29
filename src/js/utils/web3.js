// struct Challenge {
//   address user;
//   string name;
//   uint value;
//   address mentor;
//   uint startDate;
//   uint time;
//   uint mentorFee;

//   bool successed;
//   bool resolved;
// }

export const arrayToChallenge = (array, id, account) => {
  const [user, name, valueRaw, mentor, startDateRaw, timeRaw, mentorFee, successed, resolved] = array;

  const startDate = startDateRaw.toNumber();
  const time = timeRaw.toNumber();
  const value = web3.fromWei(valueRaw.toNumber(), 'ether');

  const daysToMentor = 7;

  return {
    id,
    name,
    value,
    user,
    mentor,
    startDate,
    time,
    mentorFee,
    successed,
    resolved,
    canResolve: (account === mentor || (startDate + time + (daysToMentor * 24 * 60 * 60)) < Math.floor(Date.now() / 1000)) && !resolved,
    isMentor: account === mentor,
  };
};

export const shortAddress = address => address.substring(0, 10);

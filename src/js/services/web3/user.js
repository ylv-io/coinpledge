import { getCoinContractPromise, getAccount } from './web3';

export const getUsername = async (user) => {
  const instance = await getCoinContractPromise();
  const account = getAccount();

  const result = await instance.users.call(user, {
    from: account,
  });
  const [, username] = result;
  return username;
};

export const setUsername = async (username) => {
  const instance = await getCoinContractPromise();
  const account = getAccount();

  return instance.setUsername.sendTransaction(username, {
    from: account,
  });
};

export const getAllUsers = async () => {
  const instance = await getCoinContractPromise();
  const account = getAccount();

  const userCount = (await instance.getUsersCount.call({ from: account })).toNumber();

  // get all users's challenges objects
  const promises = [...Array(userCount).keys()].map(o => instance.allUsers.call(o, {
    from: account,
  }));

  const usersAddresses = await Promise.all(promises);

  const promisesUsers = usersAddresses.map(o => instance.users.call(o, {
    from: account,
  }));
  const users = await Promise.all(promisesUsers);
  return users.map(o => ({ addr: o[0], username: o[1] }));
};

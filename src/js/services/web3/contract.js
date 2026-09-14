// Adapt Web3 0.20 callbacks to the promises used by the existing services.
const invoke = (method, args) => new Promise((resolve, reject) => {
  method(...args, (error, value) => {
    if (error) reject(error);
    else resolve(value);
  });
});

export const bindContract = async (web3js, artifact) => {
  const networkId = await invoke(web3js.version.getNetwork.bind(web3js.version), []);
  const deployment = artifact.networks[String(networkId)];
  if (!deployment) {
    throw new Error(`CoinPledge is not deployed on network ${networkId}. Deploy and export the contract first.`);
  }
  const code = await invoke(web3js.eth.getCode.bind(web3js.eth), [deployment.address]);
  if (!code || /^0x0*$/.test(code)) {
    throw new Error(`No CoinPledge contract exists at ${deployment.address}. Redeploy after resetting the local chain.`);
  }

  // Web3 0.20 predates custom errors; only pass entries it understands.
  const abi = artifact.abi.filter(entry => entry.type === 'function' || entry.type === 'event');
  const native = web3js.eth.contract(abi).at(deployment.address);
  const instance = { address: deployment.address };
  abi.forEach((entry) => {
    if (entry.type === 'event') {
      instance[entry.name] = native[entry.name];
    } else {
      const method = native[entry.name];
      instance[entry.name] = {
        call: (...args) => invoke(method.call.bind(method), args),
        sendTransaction: (...args) => invoke(method.sendTransaction.bind(method), args),
      };
    }
  });
  return instance;
};

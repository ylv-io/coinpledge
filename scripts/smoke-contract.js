// Local integration check: Forge deployment -> artifact export -> Web3 browser adapter.
process.env.BABEL_DISABLE_CACHE = '1';
require('babel-register')({ cache: false });
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const Web3 = require('web3');
const { bindContract } = require('../src/js/services/web3/contract');
const { exportContract } = require('./export-contract');

const rpcUrl = process.env.COINPLEDGE_TEST_RPC_URL || 'http://127.0.0.1:18545';
const endpoint = new URL(rpcUrl);
if (!['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname)) {
  throw new Error('This smoke test only runs against a local Anvil instance.');
}
const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
const invoke = (fn, args = []) => new Promise((resolve, reject) => {
  fn(...args, (error, value) => (error ? reject(error) : resolve(value)));
});
const mined = async (hash) => {
  let receipt;
  for (let attempt = 0; attempt < 100 && !receipt; attempt += 1) {
    receipt = await invoke(web3.eth.getTransactionReceipt, [hash]);
    if (!receipt) await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert(receipt && receipt.status !== '0x0', 'Local transaction failed or was not mined within ten seconds');
  return receipt;
};
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'coinpledge-smoke-'));
const removeDirectory = (dir) => {
  fs.readdirSync(dir).forEach((name) => {
    const file = path.join(dir, name);
    if (fs.statSync(file).isDirectory()) removeDirectory(file);
    else fs.unlinkSync(file);
  });
  fs.rmdirSync(dir);
};

const run = async () => {
  const networkId = await invoke(web3.version.getNetwork);
  const client = await invoke(web3.version.getNode);
  assert.strictEqual(String(networkId), '31337', 'Use Anvil network 31337');
  assert(/anvil/i.test(client), 'Use an isolated Anvil instance');
  const [owner, mentor, user] = await invoke(web3.eth.getAccounts);
  const deployment = spawnSync('forge', ['script', 'script/DeployCoinPledge.s.sol:DeployCoinPledge',
    '--rpc-url', rpcUrl, '--sender', owner, '--unlocked', '--broadcast'], { encoding: 'utf8' });
  assert.strictEqual(deployment.status, 0, deployment.stderr);
  const broadcast = JSON.parse(fs.readFileSync('broadcast/DeployCoinPledge.s.sol/31337/run-latest.json', 'utf8'));
  const address = broadcast.transactions.find(transaction => transaction.contractName === 'CoinPledge').contractAddress;
  fs.mkdirSync(path.join(directory, 'out/CoinPledge.sol'), { recursive: true });
  fs.mkdirSync(path.join(directory, 'deployments'));
  fs.copyFileSync('out/CoinPledge.sol/CoinPledge.json', path.join(directory, 'out/CoinPledge.sol/CoinPledge.json'));
  fs.writeFileSync(path.join(directory, 'deployments/CoinPledge.json'), '{}');
  const artifact = await exportContract(['--rpc-url', rpcUrl, '--address', address], directory);
  const instance = await bindContract(web3, artifact);
  assert.strictEqual((await instance.owner.call()).toLowerCase(), owner.toLowerCase());
  await mined(await instance.setUsername.sendTransaction('mentor', { from: mentor, gas: 500000 }));
  await mined(await instance.createChallenge.sendTransaction('precise stake', 'mentor', 1, '101',
    { from: user, value: '1000000000000000001', gas: 1000000 }));
  const challenge = await instance.challenges.call(0);
  assert.strictEqual(challenge[2].toString(10), '1000000000000000001');
  assert.strictEqual(challenge[6].toString(10), '101');
  assert.strictEqual(challenge[7], false);
  assert.strictEqual(challenge[8], false);
  assert.strictEqual((await instance.getChallengesForUser.call(user))[0].toString(10), '0');
  const filter = instance.NewChallenge({}, { fromBlock: 0, toBlock: 'latest' });
  const events = await invoke(filter.get.bind(filter));
  filter.stopWatching();
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].args.value.toString(10), '1000000000000000001');
  await mined(await instance.resolveChallenge.sendTransaction(0, true, { from: mentor, gas: 1000000 }));
  assert.strictEqual((await instance.withdrawableBalance.call(user)).toString(10), '999999999999999900');
  await mined(await instance.withdraw.sendTransaction({ from: user, gas: 500000 }));
  assert.strictEqual((await instance.withdrawableBalance.call(user)).toString(10), '0');
  assert.strictEqual((await invoke(web3.eth.getBalance, [address])).toString(10), '101');
  await mined(await instance.withdraw.sendTransaction({ from: mentor, gas: 500000 }));
  await mined(await instance.withdraw.sendTransaction({ from: owner, gas: 500000 }));
  assert.strictEqual((await invoke(web3.eth.getBalance, [address])).toString(10), '0');
  console.log('Local integration passed: Forge deployment, verified export, Web3 calls, tuple/event decoding, exact wei settlement, and withdrawals.');
};

run().catch((error) => { console.error(error); process.exitCode = 1; }).then(() => removeDirectory(directory));

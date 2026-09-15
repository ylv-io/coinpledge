// Forge -> verified artifact -> browser adapter -> Chromium, using isolated Anvil accounts only.
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { decodeEventLog, encodeEventTopics, type Abi, type Address, type Hex } from 'viem';
import { createContractClient, type Provider } from '../src/lib/contract';
import { exportContract } from './export-contract';

const rpcUrl = process.env.COINPLEDGE_TEST_RPC_URL || 'http://127.0.0.1:18545';
const endpoint = new URL(rpcUrl);
assert(['http:', 'https:'].includes(endpoint.protocol) && ['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname), 'Integration checks require a loopback Anvil URL.');
const rpc: Provider = {
  async request({ method, params = [] }) {
    const response = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), redirect: 'error', signal: AbortSignal.timeout(10000) });
    assert(response.ok, `RPC returned HTTP ${response.status}`);
    const result = await response.json() as { error?: { message: string }; result: unknown };
    if (result.error) throw new Error(result.error.message);
    return result.result;
  },
};
async function run(command: string[], env = process.env) {
  const child = Bun.spawn(command, { env, stdout: 'inherit', stderr: 'inherit' });
  assert.equal(await child.exited, 0, `${command[0]} failed`);
}
const directory = mkdtempSync(join(tmpdir(), 'coinpledge-smoke-'));
try {
  assert.equal(await rpc.request({ method: 'net_version' }), '31337', 'Use network 31337');
  assert.equal(BigInt(await rpc.request({ method: 'eth_chainId' }) as string), 31337n, 'Use chain 31337');
  assert.match(String(await rpc.request({ method: 'web3_clientVersion' })), /anvil/i, 'Use an isolated Anvil instance');
  const [owner, mentor, user] = await rpc.request({ method: 'eth_accounts' }) as Address[];
  assert(owner && mentor && user, 'Anvil must provide unlocked test accounts');
  await run(['forge', 'script', 'script/DeployCoinPledge.s.sol:DeployCoinPledge', '--rpc-url', rpcUrl, '--sender', owner, '--unlocked', '--broadcast']);
  const broadcast = JSON.parse(readFileSync('broadcast/DeployCoinPledge.s.sol/31337/run-latest.json', 'utf8'));
  const address = broadcast.transactions.find((tx: { contractName: string }) => tx.contractName === 'CoinPledge').contractAddress as Address;
  mkdirSync(join(directory, 'out/CoinPledge.sol'), { recursive: true });
  mkdirSync(join(directory, 'deployments'));
  copyFileSync('out/CoinPledge.sol/CoinPledge.json', join(directory, 'out/CoinPledge.sol/CoinPledge.json'));
  writeFileSync(join(directory, 'deployments/CoinPledge.json'), '{}');
  const artifact = await exportContract(['--rpc-url', rpcUrl, '--address', address], directory);
  const abi = artifact.abi as Abi;
  // Model a wallet with one selected account; never bypass the adapter's account checks.
  let selected = owner;
  const provider: Provider = { request: args => args.method === 'eth_accounts' ? Promise.resolve([selected]) : rpc.request(args) };
  const client = await createContractClient(provider, artifact);
  assert.equal((await client.read<Address>('owner')).toLowerCase(), owner.toLowerCase());
  async function send(account: Address, name: string, args: unknown[] = [], value = 0n) {
    selected = account;
    await client.waitForReceipt(await client.write(account, name, args, value));
  }
  await send(mentor, 'setUsername', ['mentor']);
  await send(user, 'createChallenge', ['precise stake', 'mentor', 1n, 101n], 1000000000000000001n);
  const profile = await client.profile(user);
  assert.equal(profile.challenges[0].value, 1000000000000000001n);
  assert.equal(profile.challenges[0].mentorFee, 101n);
  assert.equal(profile.challenges[0].successed, false);
  const logs = await rpc.request({ method: 'eth_getLogs', params: [{ address, topics: encodeEventTopics({ abi, eventName: 'NewChallenge' }), fromBlock: '0x0', toBlock: 'latest' }] }) as { data: Hex; topics: [Hex, ...Hex[]] }[];
  assert.equal(logs.length, 1);
  const event = decodeEventLog({ abi, ...logs[0] });
  assert.equal((event.args as unknown as { value: bigint }).value, 1000000000000000001n);
  await send(mentor, 'resolveChallenge', [0n, true]);
  assert.equal(await client.read<bigint>('withdrawableBalance', [user]), 999999999999999900n);
  await send(user, 'withdraw');
  assert.equal(await client.read<bigint>('withdrawableBalance', [user]), 0n);
  assert.equal(BigInt(await rpc.request({ method: 'eth_getBalance', params: [address, 'latest'] }) as string), 101n);
  await send(mentor, 'withdraw');
  await send(owner, 'withdraw');
  assert.equal(BigInt(await rpc.request({ method: 'eth_getBalance', params: [address, 'latest'] }) as string), 0n);
  console.log('Adapter integration passed: exact wei, tuple/events, settlement and withdrawals.');
  await run(['bun', 'run', 'test:browser'], {
    ...process.env,
    COINPLEDGE_TEST_RPC_URL: rpcUrl,
    COINPLEDGE_ARTIFACT_PATH: join(directory, 'build/contracts/CoinPledge.json'),
    COINPLEDGE_TEST_ACCOUNTS: JSON.stringify([owner, mentor, user]),
  });
} finally { rmSync(directory, { recursive: true, force: true }); }

import { decodeEventLog, decodeFunctionResult, encodeEventTopics, encodeFunctionData, isAddress, toHex, type Abi, type Address, type Hex } from 'viem';
import { sameAddress, type Challenge, type Dashboard, type Donation, type Profile, type User } from './model';

export interface Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
}
export interface ContractArtifact {
  abi: unknown[];
  deployedBytecode: string;
  networks: Record<string, { address: string }>;
}
export interface Receipt { status: Hex; transactionHash: Hex; blockNumber: Hex }

export async function accounts(provider: Provider, requestPermission = false): Promise<Address[]> {
  const result = await provider.request({ method: requestPermission ? 'eth_requestAccounts' : 'eth_accounts' });
  if (!Array.isArray(result) || result.some(value => typeof value !== 'string' || !isAddress(value, { strict: false }))) {
    throw new Error('The wallet returned invalid account information.');
  }
  return result as Address[];
}

export async function createContractClient(provider: Provider, artifact: ContractArtifact) {
  const [network, chain] = await Promise.all([
    provider.request({ method: 'net_version' }), provider.request({ method: 'eth_chainId' }),
  ]);
  const networkId = String(network);
  if (!/^\d+$/.test(networkId) || typeof chain !== 'string' || !/^0x[\da-f]+$/i.test(chain)) throw new Error('The wallet returned an invalid network.');
  const chainId = BigInt(chain);
  const deployment = artifact.networks[networkId];
  if (!deployment || !isAddress(deployment.address, { strict: false })) {
    throw new Error(`CoinPledge is not deployed on network ${networkId}. Switch to a configured network.`);
  }
  const address = deployment.address as Address;
  const code = await provider.request({ method: 'eth_getCode', params: [address, 'latest'] });
  if (typeof code !== 'string' || code === '0x' || code.toLowerCase() !== artifact.deployedBytecode.toLowerCase()) {
    throw new Error('This deployment does not match the current CoinPledge contract. Reload after a verified deployment is registered.');
  }
  const abi = artifact.abi as Abi;

  async function assertNetwork() {
    const current = await provider.request({ method: 'eth_chainId' });
    if (typeof current !== 'string' || BigInt(current) !== chainId) throw new Error('The wallet network changed. Reconnect before continuing.');
  }

  async function assertAccount(account: Address) {
    await assertNetwork();
    if (!sameAddress((await accounts(provider))[0], account)) throw new Error('The wallet account changed. Please try again.');
  }

  async function read<T>(functionName: string, args: readonly unknown[] = [], block = 'latest'): Promise<T> {
    const data = encodeFunctionData({ abi, functionName, args });
    const result = await provider.request({ method: 'eth_call', params: [{ to: address, data }, block] });
    return decodeFunctionResult({ abi, functionName, data: result as Hex }) as T;
  }

  async function write(account: Address, functionName: string, args: readonly unknown[] = [], value = 0n): Promise<Hex> {
    await assertAccount(account);
    const tx = { from: account, to: address, data: encodeFunctionData({ abi, functionName, args }), value: toHex(value) };
    const gas = await provider.request({ method: 'eth_estimateGas', params: [tx] });
    // Wallet state can change while an RPC request or approval is in progress.
    await assertAccount(account);
    return await provider.request({ method: 'eth_sendTransaction', params: [{ ...tx, gas }] }) as Hex;
  }

  async function waitForReceipt(hash: Hex, timeoutMs = 120000): Promise<Receipt> {
    const until = Date.now() + timeoutMs;
    while (Date.now() < until) {
      await assertNetwork();
      const receipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [hash] }) as Receipt | null;
      if (receipt) {
        if (receipt.status !== '0x1') throw new Error('The transaction reverted. Check your wallet for details.');
        return receipt;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    throw new Error('Confirmation is taking longer than expected. Check your wallet before submitting again.');
  }

  async function challengesFor(account: Address, mentoring: boolean, block: string): Promise<Challenge[]> {
    const ids = await read<bigint[]>(mentoring ? 'getChallengesForMentor' : 'getChallengesForUser', [account], block);
    const rows = await Promise.all(ids.map(async (id) => {
      const [user, name, value, mentor, startDate, time, mentorFee, successed, resolved] = await read<[Address, string, bigint, Address, bigint, bigint, bigint, boolean, boolean]>('challenges', [id], block);
      return { id, user, name, value, mentor, startDate, time, mentorFee, successed, resolved };
    }));
    return rows.reverse();
  }

  async function profile(account: Address, block = 'latest'): Promise<Profile> {
    const [user, bonus, withdrawable, challenges, mentoring] = await Promise.all([
      read<[Address, string]>('users', [account], block), read<bigint>('getBonusFund', [account], block),
      read<bigint>('withdrawableBalance', [account], block), challengesFor(account, false, block), challengesFor(account, true, block),
    ]);
    return { address: account, username: user[1], bonus, withdrawable, challenges, mentoring };
  }

  async function donations(block = 'latest'): Promise<Donation[]> {
    const logs = await provider.request({ method: 'eth_getLogs', params: [{ address, topics: encodeEventTopics({ abi, eventName: 'Donation' }), fromBlock: '0x0', toBlock: block }] }) as { data: Hex; topics: [Hex, ...Hex[]]; transactionHash: Hex; logIndex: Hex; removed?: boolean }[];
    const records = new Map<string, Donation>();
    for (const log of logs) {
      if (log.removed) continue;
      const event = decodeEventLog({ abi, data: log.data, topics: log.topics, strict: true });
      if (event.eventName !== 'Donation') continue;
      const args = event.args as unknown as Omit<Donation, 'id'>;
      const id = `${log.transactionHash}:${log.logIndex}`;
      records.set(id, { id, name: args.name, url: args.url, value: args.value, timestamp: args.timestamp });
    }
    return [...records.values()].sort((a, b) => a.value === b.value ? 0 : a.value > b.value ? -1 : 1);
  }

  async function dashboard(account: Address): Promise<Dashboard> {
    await assertNetwork();
    const block = await provider.request({ method: 'eth_getBlockByNumber', params: ['latest', false] }) as { number: Hex; timestamp: Hex };
    const count = await read<bigint>('getUsersCount', [], block.number);
    if (count > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error('The user directory is too large to load.');
    const users = await Promise.all(Array.from({ length: Number(count) }, async (_, i): Promise<User> => {
      const addr = await read<Address>('allUsers', [BigInt(i)], block.number);
      const [, name] = await read<[Address, string]>('users', [addr], block.number);
      return { addr, name };
    }));
    let warning = '';
    const [currentProfile, gameOver, history] = await Promise.all([
      profile(account, block.number), read<boolean>('isGameOver', [], block.number),
      donations(block.number).catch(() => { warning = 'Donation history could not be loaded from this network.'; return []; }),
    ]);
    return { users, profile: currentProfile, donations: history, gameOver, timestamp: BigInt(block.timestamp), warning };
  }

  return { address, networkId, chainId, read, write, waitForReceipt, profile, donations, dashboard };
}

export type ContractClient = Awaited<ReturnType<typeof createContractClient>>;

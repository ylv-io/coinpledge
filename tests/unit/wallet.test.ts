import { expect, test } from 'bun:test';
import { emptyWallet, WalletSession } from '../../src/lib/wallet';
import { artifact, FakeProvider, other, user } from './provider';

test('connect is explicit and rejected requests become visible errors', async () => {
  const provider = new FakeProvider();
  provider.connected = false;
  const session = new WalletSession(provider, artifact);
  let state = emptyWallet();
  session.subscribe(value => { state = value; });
  await session.connect(false);
  expect(state.account).toBeUndefined();
  provider.requestHook = async method => { if (method === 'eth_requestAccounts') throw { code: 4001 }; };
  await session.connect();
  expect(state.error).toBe('Request declined in your wallet.');
});

test('late reads cannot restore an account after disconnect, and listeners are removed', async () => {
  const provider = new FakeProvider();
  const session = new WalletSession(provider, artifact);
  let state = emptyWallet();
  session.subscribe(value => { state = value; });
  const stop = session.start();
  await session.connect();
  expect(state.account).toBe(user);
  let release!: () => void;
  provider.requestHook = method => method === 'eth_getBlockByNumber' ? new Promise<void>(resolve => { release = resolve; }) : Promise.resolve();
  const refreshing = session.refresh();
  while (!release) await new Promise(resolve => setTimeout(resolve, 0));
  provider.emit('disconnect');
  expect(state.account).toBeUndefined();
  release();
  await refreshing;
  expect(state.data).toBeUndefined();
  stop();
  expect([...provider.listeners.values()].every(listeners => listeners.size === 0)).toBe(true);
});

test('account changes replace the dashboard and transaction failures clear pending state', async () => {
  const provider = new FakeProvider();
  const session = new WalletSession(provider, artifact);
  let state = emptyWallet();
  session.subscribe(value => { state = value; });
  await session.connect();
  provider.selected = other;
  await session.connect(false);
  expect(state.account).toBe(other);
  expect(state.data?.profile.address).toBe(other);
  provider.status = '0x0';
  expect(await session.transact('Withdrawal', (client, account) => client.write(account, 'withdraw'))).toBe(false);
  expect(state.busy).toBe('');
  expect(state.notice).toBe('');
  expect(state.error).toContain('reverted');
});

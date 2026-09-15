import { expect, test } from 'bun:test';
import { encodeAbiParameters, encodeEventTopics, type Hex } from 'viem';
import { createContractClient } from '../../src/lib/contract';
import { abi, artifact, FakeProvider, other, user } from './provider';

test('refuses missing deployment and stale runtime bytecode', async () => {
  const provider = new FakeProvider();
  await expect(createContractClient(provider, { ...artifact, networks: {} })).rejects.toThrow('not deployed');
  provider.code = '0x1234';
  await expect(createContractClient(provider, artifact)).rejects.toThrow('does not match');
});

test('writes exact value and ABI arguments after validating wallet state', async () => {
  const provider = new FakeProvider();
  const client = await createContractClient(provider, artifact);
  await client.write(user, 'donate', ['Name', 'https://example.com'], 1000000000000000001n);
  expect(provider.sent).toHaveLength(1);
  expect(provider.sent[0]).toMatchObject({ from: user, to: client.address, value: '0xde0b6b3a7640001', gas: '0x100000' });
});

test('does not send after an account or network changes during gas estimation', async () => {
  for (const mutate of [(p: FakeProvider) => { p.selected = other; }, (p: FakeProvider) => { p.chain = '0x1'; }]) {
    const provider = new FakeProvider();
    const client = await createContractClient(provider, artifact);
    provider.estimateHook = () => mutate(provider);
    await expect(client.write(user, 'withdraw')).rejects.toThrow('changed');
    expect(provider.sent).toHaveLength(0);
  }
});

test('rejects reverted receipts and network changes while confirming', async () => {
  const provider = new FakeProvider();
  const client = await createContractClient(provider, artifact);
  provider.status = '0x0';
  await expect(client.waitForReceipt('0x01')).rejects.toThrow('reverted');
  provider.chain = '0x1';
  await expect(client.waitForReceipt('0x01')).rejects.toThrow('network changed');
});

test('donations use transaction/log identity, exact numeric ordering and ignore removed logs', async () => {
  const provider = new FakeProvider();
  const topics = encodeEventTopics({ abi, eventName: 'Donation' });
  const log = (value: bigint, logIndex: Hex, removed = false) => ({ topics, data: encodeAbiParameters([{ type: 'string' }, { type: 'string' }, { type: 'uint256' }, { type: 'uint256' }], ['Donor', '', value, 100n]), transactionHash: '0x01', logIndex, removed });
  provider.logs = [log(2n, '0x0'), log(10n, '0x1'), log(2n, '0x0'), log(99n, '0x2', true)];
  const client = await createContractClient(provider, artifact);
  expect((await client.donations()).map(row => row.value)).toEqual([10n, 2n]);
});

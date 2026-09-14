import { bindContract } from '../../services/web3/contract';

const setup = (networks = { 31337: { address: '0x1234' } }, code = '0x6001') => {
  const native = {
    read: { call: jest.fn((options, callback) => callback(null, '9007199254740993')) },
    write: { sendTransaction: jest.fn((value, options, callback) => callback(null, '0xhash')) },
    Changed: jest.fn(),
  };
  const artifact = {
    networks,
    abi: [{ type: 'function', name: 'read' }, { type: 'function', name: 'write' },
      { type: 'event', name: 'Changed' }, { type: 'error', name: 'CustomError' }],
  };
  const web3 = {
    version: { getNetwork: callback => callback(null, '31337') },
    eth: {
      getCode: (address, callback) => callback(null, code),
      contract: jest.fn(() => ({ at: () => native })),
    },
  };
  return { native, artifact, web3 };
};

test('binds reads, transactions, and events without changing wei precision', async () => {
  const { native, artifact, web3 } = setup();
  const instance = await bindContract(web3, artifact);
  const options = { from: 'account', value: '9007199254740993' };
  expect(await instance.read.call(options)).toBe('9007199254740993');
  expect(await instance.write.sendTransaction('argument', options)).toBe('0xhash');
  expect(native.write.sendTransaction.mock.calls[0].slice(0, 2)).toEqual(['argument', options]);
  expect(instance.Changed).toBe(native.Changed);
  expect(web3.eth.contract.mock.calls[0][0]).toHaveLength(3);
});

test('reports networks without a registered deployment', async () => {
  const { artifact, web3 } = setup({});
  await expect(bindContract(web3, artifact)).rejects.toThrow('not deployed on network 31337');
});

test('reports a deployment missing after a local chain reset', async () => {
  const { artifact, web3 } = setup(undefined, '0x');
  await expect(bindContract(web3, artifact)).rejects.toThrow('Redeploy after resetting');
});

test('propagates provider and transaction errors', async () => {
  const { native, artifact, web3 } = setup();
  native.write.sendTransaction = callback => callback(new Error('rejected'));
  const instance = await bindContract(web3, artifact);
  await expect(instance.write.sendTransaction()).rejects.toThrow('rejected');
  web3.version.getNetwork = callback => callback(new Error('network unavailable'));
  await expect(bindContract(web3, artifact)).rejects.toThrow('network unavailable');
});

import Web3 from 'web3';
import { arrayToChallenge } from '../../utils/web3';

const deadline = 1000 + 86400 + (7 * 86400);
let now;
let tuple;
beforeEach(() => {
  global.web3 = new Web3();
  now = jest.spyOn(Date, 'now').mockImplementation(() => deadline * 1000);
  tuple = ['user', 'goal', web3.toBigNumber('1000000000000000001'), 'mentor',
    web3.toBigNumber(1000), web3.toBigNumber(86400), web3.toBigNumber('101'), false, false];
});

afterEach(() => {
  now.mockRestore();
  delete global.web3;
});

test('preserves every wei in displayed stake and reward', () => {
  const challenge = arrayToChallenge(tuple, 0, 'user');
  expect(challenge.value).toBe('1.000000000000000001');
  expect(challenge.mentorFee).toBe('0.000000000000000101');
});

test('matches contract permissions at the exact self-resolution boundary', () => {
  expect(arrayToChallenge(tuple, 0, 'user').canResolve).toBe(true);
  expect(arrayToChallenge(tuple, 0, 'stranger').canResolve).toBe(false);
  now.mockImplementation(() => (deadline - 1) * 1000);
  expect(arrayToChallenge(tuple, 0, 'user').canResolve).toBe(false);
  expect(arrayToChallenge(tuple, 0, 'mentor').canResolve).toBe(true);
  tuple[8] = true;
  expect(arrayToChallenge(tuple, 0, 'mentor').canResolve).toBe(false);
});

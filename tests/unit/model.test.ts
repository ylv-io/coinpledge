import { describe, expect, test } from 'bun:test';
import { amountInWei, canResolve, challengeInput, ether, GRACE_PERIOD, MIN_STAKE, routeFor, safeUrl, validateUsername, type Challenge } from '../../src/lib/model';
import type { Address } from 'viem';
const user: Address = '0x1111111111111111111111111111111111111111';
const mentor: Address = '0x2222222222222222222222222222222222222222';
const users = [{ addr: mentor, name: 'mentor' }];
const challenge: Challenge = { id: 0n, user, mentor, name: 'Goal', value: MIN_STAKE, startDate: 100n, time: 200n, mentorFee: 0n, successed: false, resolved: false };

describe('exact amounts', () => {
  test('preserves every wei beyond Number precision', () => {
    expect(amountInWei('1.000000000000000001')).toBe(1000000000000000001n);
    expect(ether(1000000000000000001n)).toBe('1.000000000000000001');
  });
  test.each(['1e2', '-1', '0.0000000000000000001', 'NaN', '', '1,000', '1.2.3'])('rejects invalid amount %s', value => {
    expect(() => amountInWei(value)).toThrow();
  });
  test('enforces minimum and uint256 bound', () => {
    expect(() => amountInWei('0.009', MIN_STAKE)).toThrow('minimum');
    expect(() => amountInWei('1' + '0'.repeat(78))).toThrow('too large');
  });
});

test('challenge validation preserves exact stake/reward and uses duration seconds', () => {
  const input = { name: ' Goal ', stake: '1.000000000000000001', mentor: 'mentor', reward: '0.000000000000000101', deadline: '2030-01-02T00:00:00Z' };
  expect(challengeInput(input, users, user, Date.parse('2030-01-01T00:00:00Z'))).toEqual({ name: 'Goal', stake: 1000000000000000001n, mentor: 'mentor', reward: 101n, duration: 86400n });
  expect(() => challengeInput(input, users, mentor)).toThrow('someone else');
  expect(() => challengeInput({ ...input, reward: '2' }, users, user)).toThrow('exceed');
  expect(() => challengeInput({ ...input, deadline: '2000-01-01' }, users, user)).toThrow('future');
  expect(() => challengeInput({ ...input, mentor: 'missing' }, users, user)).toThrow('registered');
});

test('username limits count UTF-8 bytes and preserve case sensitivity', () => {
  expect(validateUsername('€')).toBe('€');
  expect(validateUsername('Mentor', users)).toBe('Mentor');
  expect(() => validateUsername('mentor', users)).toThrow('taken');
  expect(() => validateUsername('😀'.repeat(9))).toThrow('3–32');
  expect(() => validateUsername('ab')).toThrow('3–32');
});

test('resolution permissions match the exact seven-day boundary', () => {
  expect(canResolve(challenge, mentor, 0n)).toBe(true);
  expect(canResolve(challenge, user, 300n + GRACE_PERIOD - 1n)).toBe(false);
  expect(canResolve(challenge, user, 300n + GRACE_PERIOD)).toBe(true);
  expect(canResolve(challenge, '0x3333333333333333333333333333333333333333', 999999999n)).toBe(false);
  expect(canResolve({ ...challenge, resolved: true }, mentor, 999999999n)).toBe(false);
});

test('only http(s) donation links are clickable and profile routes require addresses', () => {
  expect(safeUrl('javascript:alert(1)')).toBeUndefined();
  expect(safeUrl('data:text/html,hello')).toBeUndefined();
  expect(safeUrl('https://example.com')).toBe('https://example.com/');
  expect(routeFor('/account/').page).toBe('account');
  expect(routeFor('/' + user)).toEqual({ page: 'profile', address: user });
  expect(routeFor('/arbitrary')).toEqual({ page: 'notfound' });
});

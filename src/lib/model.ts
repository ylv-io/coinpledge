import { formatEther, isAddress, parseEther, type Address } from 'viem';

export const GRACE_PERIOD = 7n * 24n * 60n * 60n;
export const MIN_STAKE = 10n ** 16n;
export const MAX_UINT256 = (1n << 256n) - 1n;

export interface User { addr: Address; name: string }
export interface Challenge {
  id: bigint;
  user: Address;
  name: string;
  value: bigint;
  mentor: Address;
  startDate: bigint;
  time: bigint;
  mentorFee: bigint;
  successed: boolean;
  resolved: boolean;
}
export interface Donation { id: string; name: string; url: string; value: bigint; timestamp: bigint }
export interface Profile {
  address: Address;
  username: string;
  bonus: bigint;
  withdrawable: bigint;
  challenges: Challenge[];
  mentoring: Challenge[];
}
export interface Dashboard {
  users: User[];
  profile: Profile;
  donations: Donation[];
  gameOver: boolean;
  timestamp: bigint;
  warning: string;
}

export const sameAddress = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
export const shortAddress = (value: string) => `${value.slice(0, 6)}…${value.slice(-4)}`;
export const ether = (value: bigint) => formatEther(value);
export const userLabel = (address: Address, users: User[]) => users.find(user => sameAddress(user.addr, address))?.name || shortAddress(address);

export function amountInWei(value: string, minimum = 0n): bigint {
  if (!/^\d+(\.\d{1,18})?$/.test(value.trim())) {
    throw new Error('Enter an ether amount with at most 18 decimal places.');
  }
  const amount = parseEther(value.trim());
  if (amount < minimum) throw new Error(`The minimum amount is ${ether(minimum)} ETH.`);
  if (amount > MAX_UINT256) throw new Error('The amount is too large.');
  return amount;
}

export function validateUsername(name: string, users: User[] = []): string {
  const length = new TextEncoder().encode(name).length;
  if (length < 3 || length > 32) throw new Error('Use a username of 3–32 UTF-8 bytes.');
  if (users.some(user => user.name === name)) throw new Error('That username is already taken.');
  return name;
}

export function challengeInput(values: { name: string; stake: string; mentor: string; reward: string; deadline: string }, users: User[], account: Address, now = Date.now()) {
  const name = values.name.trim();
  if (!name) throw new Error('Describe your goal.');
  const mentor = users.find(user => user.name === values.mentor);
  if (!mentor) throw new Error('Choose a registered mentor.');
  if (sameAddress(mentor.addr, account)) throw new Error('Choose someone else as your mentor.');
  const stake = amountInWei(values.stake, MIN_STAKE);
  const reward = amountInWei(values.reward);
  if (reward > stake) throw new Error('The mentor reward cannot exceed the stake.');
  const deadline = new Date(values.deadline).getTime();
  if (!Number.isFinite(deadline) || deadline <= now) throw new Error('Choose a deadline in the future.');
  const duration = BigInt(Math.floor(deadline / 1000) - Math.floor(now / 1000));
  if (duration <= 0n) throw new Error('Choose a deadline in the future.');
  return { name, mentor: mentor.name, stake, reward, duration };
}

export function canResolve(challenge: Challenge, account: string | undefined, timestamp: bigint): boolean {
  return !challenge.resolved && (sameAddress(account, challenge.mentor)
    || (sameAddress(account, challenge.user) && timestamp >= challenge.startDate + challenge.time + GRACE_PERIOD));
}

export function dateLabel(timestamp: bigint): string {
  if (timestamp > 8640000000000n || timestamp < 0n) return 'Beyond the supported calendar range';
  return new Date(Number(timestamp) * 1000).toLocaleString();
}

export function defaultDeadline(): string {
  const date = new Date(Date.now() + Number(GRACE_PERIOD) * 1000);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

export function safeUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch { return undefined; }
}

export function routeFor(pathname: string): { page: string; address?: Address } {
  const path = pathname.replace(/\/+$/, '') || '/';
  const pages: Record<string, string> = { '/': 'home', '/new': 'new', '/account': 'account', '/challenges': 'challenges', '/mentor': 'mentor', '/users': 'users', '/donate': 'donate', '/donations': 'donations' };
  if (pages[path]) return { page: pages[path] };
  const address = path.slice(1);
  return isAddress(address, { strict: false }) ? { page: 'profile', address } : { page: 'notfound' };
}

export function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error && error.code === 4001) return 'Request declined in your wallet.';
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

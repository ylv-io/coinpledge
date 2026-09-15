import { test, expect, type Page } from '@playwright/test';
const rpcUrl = process.env.COINPLEDGE_TEST_RPC_URL;
const accounts = JSON.parse(process.env.COINPLEDGE_TEST_ACCOUNTS || '[]') as string[];
if (!rpcUrl || accounts.length < 3 || !process.env.COINPLEDGE_ARTIFACT_PATH) throw new Error('Run browser checks through bun run test:integration with a local Anvil instance.');

async function injectWallet(page: Page) {
  await page.addInitScript(({ rpcUrl, accounts }) => {
    let selected = accounts[2];
    let connected = false;
    let wrongNetwork = false;
    const listeners = new Map<string, Set<(...args: unknown[]) => void>>();
    const emit = (event: string) => { for (const listener of listeners.get(event) || []) listener(); };
    window.ethereum = {
      on(event, listener) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event)!.add(listener); },
      removeListener(event, listener) { listeners.get(event)?.delete(listener); },
      async request({ method, params = [] }) {
        if (method === 'eth_requestAccounts') connected = true;
        if (method === 'eth_accounts' || method === 'eth_requestAccounts') return connected ? [selected] : [];
        if (wrongNetwork && method === 'eth_chainId') return '0x1';
        if (wrongNetwork && method === 'net_version') return '1';
        const response = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) });
        const result = await response.json();
        if (result.error) throw new Error(result.error.message);
        return result.result;
      },
    };
    Object.assign(window, { testWallet: {
      select(index: number) { selected = accounts[index]; emit('accountsChanged'); },
      network(wrong: boolean) { wrongNetwork = wrong; emit('chainChanged'); },
      disconnect() { connected = false; emit('disconnect'); },
    } });
  }, { rpcUrl: rpcUrl!, accounts });
}
async function switchAccount(page: Page, index: number) {
  await page.evaluate(index => (window as unknown as { testWallet: { select(index: number): void } }).testWallet.select(index), index);
}

test('wallet-free landing, static deep links and mobile navigation', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Put your goals into action.' })).toBeVisible();
  await page.screenshot({ path: info.outputPath('home-desktop.png'), fullPage: true });
  await page.goto('/?p=/account&q=example=1~and~second=2');
  await expect(page).toHaveURL(/\/account\?example=1&second=2$/);
  await expect(page.getByRole('heading', { name: 'Connect your wallet' })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Toggle navigation' }).click();
  await page.getByRole('link', { name: 'People', exact: true }).click();
  await expect(page).toHaveURL(/\/users$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goto('/');
  await page.screenshot({ path: info.outputPath('home-mobile.png'), fullPage: true });
  await page.goto('/missing');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('register, stake, mentor, withdraw and donate through the real local contract', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await injectWallet(page);
  await page.goto('/account');
  await page.getByRole('button', { name: 'Connect to continue' }).click();
  await page.getByLabel('Username', { exact: true }).fill('challenger');
  await page.getByRole('button', { name: 'Register username' }).click();
  await expect(page.getByText('Registered as challenger.')).toBeVisible();
  await page.getByRole('link', { name: 'New challenge', exact: true }).click();
  await page.getByLabel('Your goal').fill('Finish the Svelte migration');
  await page.getByLabel('Stake (ETH)', { exact: true }).fill('1.000000000000000001');
  await page.getByLabel('Mentor', { exact: true }).selectOption('mentor');
  await page.getByLabel('Reward budget (ETH)').fill('0.000000000000000101');
  await page.getByRole('button', { name: 'Stake and create challenge' }).click();
  const card = page.getByRole('article').filter({ hasText: 'Finish the Svelte migration' });
  await expect(card).toContainText('1.000000000000000001');
  await expect(card.getByRole('button', { name: 'Mark succeeded' })).toHaveCount(0);
  await page.screenshot({ path: info.outputPath('challenge-desktop.png'), fullPage: true });
  await switchAccount(page, 1);
  await page.getByRole('link', { name: 'Mentoring', exact: true }).click();
  await card.getByRole('button', { name: 'Mark succeeded' }).click();
  await expect(card.getByText('Succeeded', { exact: true })).toBeVisible();
  await switchAccount(page, 2);
  await page.getByRole('link', { name: 'Account', exact: true }).click();
  await expect(page.getByTestId('withdrawable')).toHaveText('0.9999999999999999 ETH');
  await page.getByRole('button', { name: 'Withdraw to wallet' }).click();
  await expect(page.getByTestId('withdrawable')).toHaveText('0 ETH');
  await page.getByRole('link', { name: 'Support the project' }).click();
  await page.getByLabel('Name (optional)').fill('Svelte supporter');
  await page.getByLabel('Website (optional)').fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Donate', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('http:// or https://');
  await page.getByLabel('Website (optional)').fill('https://example.com');
  await page.getByRole('button', { name: 'Donate', exact: true }).click();
  await expect(page.getByText('Donation confirmed.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'All donations' }).click();
  await expect(page.getByRole('link', { name: 'Svelte supporter ↗' })).toHaveAttribute('href', 'https://example.com/');
  await page.getByRole('link', { name: 'People', exact: true }).click();
  await page.getByRole('link', { name: `challenger ${accounts[2]}` }).click();
  await expect(page.getByRole('heading', { name: 'challenger', exact: true })).toBeVisible();
  await expect(card).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: info.outputPath('profile-mobile.png'), fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.evaluate(() => (window as unknown as { testWallet: { network(wrong: boolean): void } }).testWallet.network(true));
  await expect(page.getByRole('alert')).toContainText('not deployed on network 1');
  await expect(card).toHaveCount(0);
  await page.evaluate(() => (window as unknown as { testWallet: { network(wrong: boolean): void } }).testWallet.network(false));
  await expect(card).toBeVisible();
  await page.evaluate(() => (window as unknown as { testWallet: { disconnect(): void } }).testWallet.disconnect());
  await expect(page.getByRole('heading', { name: 'Connect your wallet' })).toBeVisible();
  await expect(card).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('failed stakes, challenger grace period and shutdown balances stay usable', async ({ page }) => {
  await injectWallet(page);
  await page.goto('/new');
  await page.getByRole('button', { name: 'Connect to continue' }).click();
  async function createGoal(name: string) {
    if (!page.url().endsWith('/new')) await page.getByRole('link', { name: 'New challenge', exact: true }).first().click();
    await page.getByLabel('Your goal').fill(name);
    await page.getByLabel('Mentor', { exact: true }).selectOption('mentor');
    await page.getByRole('button', { name: 'Stake and create challenge' }).click();
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
  }
  await createGoal('A failed commitment');
  await switchAccount(page, 1);
  await page.getByRole('link', { name: 'Mentoring', exact: true }).click();
  const failed = page.getByRole('article').filter({ hasText: 'A failed commitment' });
  await failed.getByRole('button', { name: 'Mark failed' }).click();
  await expect(failed.getByText('Failed', { exact: true })).toBeVisible();
  await switchAccount(page, 2);
  await page.getByRole('link', { name: 'Account', exact: true }).click();
  await expect(page.locator('.account-balances').getByText('0.01 ETH', { exact: true })).toBeVisible();
  await expect(page.getByTestId('withdrawable')).toHaveText('0 ETH');
  await createGoal('Resolve after the grace period');
  const expired = page.getByRole('article').filter({ hasText: 'Resolve after the grace period' });
  await expect(expired.getByRole('button', { name: 'Mark succeeded' })).toHaveCount(0);
  async function rpc(method: string, params: unknown[] = []) {
    const response = await fetch(rpcUrl!, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), redirect: 'error' });
    const body = await response.json() as { error?: { message: string }; result: unknown };
    if (body.error) throw new Error(body.error.message);
    return body.result;
  }
  await rpc('evm_increaseTime', [15 * 24 * 60 * 60]);
  await rpc('evm_mine');
  await expect(expired.getByRole('button', { name: 'Mark succeeded' })).toBeVisible({ timeout: 10000 });
  await expired.getByRole('button', { name: 'Mark succeeded' }).click();
  await expect(expired.getByText('Succeeded', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Account', exact: true }).click();
  await expect(page.getByTestId('withdrawable')).toHaveText('0.015 ETH');
  const artifact = await Bun.file(process.env.COINPLEDGE_ARTIFACT_PATH!).json();
  const { encodeFunctionData } = await import('viem');
  await rpc('eth_sendTransaction', [{ from: accounts[0], to: artifact.networks['31337'].address, data: encodeFunctionData({ abi: artifact.abi, functionName: 'gameOver' }), gas: '0x100000' }]);
  await expect(page.getByText('CoinPledge has shut down.', { exact: false })).toBeVisible({ timeout: 10000 });
  await expect(page.getByTestId('withdrawable')).toHaveText('0.02 ETH');
  await page.getByRole('button', { name: 'Withdraw to wallet' }).click();
  await expect(page.getByTestId('withdrawable')).toHaveText('0 ETH');
  await page.getByRole('link', { name: 'New challenge', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Stake and create challenge' })).toBeDisabled();
  await page.getByRole('link', { name: 'Support the project' }).click();
  await expect(page.getByRole('button', { name: 'Donate', exact: true })).toBeDisabled();
  await switchAccount(page, 0);
  await page.getByRole('link', { name: 'Account', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Register username' })).toBeDisabled();
});

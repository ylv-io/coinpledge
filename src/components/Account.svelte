<script lang="ts">
  import { ether, errorMessage, validateUsername, type Profile, type User } from '../lib/model';
  import type { WalletSession } from '../lib/wallet';
  let { profile, users, session, busy, gameOver }: { profile: Profile; users: User[]; session: WalletSession; busy: boolean; gameOver: boolean } = $props();
  let username = $state('');
  let error = $state('');
  async function register(event: SubmitEvent) {
    event.preventDefault();
    error = '';
    try {
      const name = validateUsername(username, users);
      await session.transact('Username registration', (client, account) => client.write(account, 'setUsername', [name]));
    } catch (cause) { error = errorMessage(cause); }
  }
</script>
<h1 class="title">Account</h1>
<p class="address page-intro">{profile.address}</p>
<div class="columns account-balances">
  <section class="column"><div class="box"><h2 class="title is-5">Available to withdraw</h2><p class="balance" data-testid="withdrawable">{ether(profile.withdrawable)} ETH</p><button class="button is-success" disabled={busy || profile.withdrawable === 0n} onclick={() => session.transact('Withdrawal', (client, account) => client.write(account, 'withdraw'))}>Withdraw to wallet</button><p class="help">Includes settled stakes, rewards and credited donations{gameOver ? ', plus unlocked bonuses' : ''}.</p></div></section>
  <section class="column"><div class="box"><h2 class="title is-5">Bonus fund</h2><p class="balance">{ether(profile.bonus)} ETH</p><p>{gameOver ? 'Your bonus fund is now included in the withdrawal balance.' : 'Complete a future challenge successfully to release a share of your bonus fund.'}</p></div></section>
</div>
<section class="box form-panel">
  <h2 class="title is-4">Username</h2>
  {#if profile.username}<p>Registered as <strong>{profile.username}</strong>.</p><p class="help">Your username is permanent and case-sensitive.</p>
  {:else}<p class="page-intro">Register to become a mentor. You can create challenges without a username.</p><form onsubmit={register}><fieldset disabled={busy || gameOver}><div class="field"><label class="label" for="username">Username</label><input id="username" class="input" bind:value={username} required /><p class="help">3–32 UTF-8 bytes. Unique, case-sensitive and permanent.</p></div>{#if error}<p class="notification is-danger" role="alert">{error}</p>{/if}<button class="button is-success" type="submit">Register username</button></fieldset></form>{/if}
</section>

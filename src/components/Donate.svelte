<script lang="ts">
  import { amountInWei, errorMessage, MIN_STAKE, safeUrl } from '../lib/model';
  import type { WalletSession } from '../lib/wallet';
  let { session, disabled }: { session: WalletSession; disabled: boolean } = $props();
  let name = $state('');
  let url = $state('');
  let value = $state('0.01');
  let error = $state('');
  async function donate(event: SubmitEvent) {
    event.preventDefault();
    error = '';
    try {
      const amount = amountInWei(value, MIN_STAKE);
      if (url.trim() && !safeUrl(url.trim())) throw new Error('Use an http:// or https:// website address.');
      const confirmed = await session.transact('Donation', (client, account) => client.write(account, 'donate', [name.trim(), url.trim()], amount));
      if (confirmed) { name = ''; url = ''; }
    } catch (cause) { error = errorMessage(cause); }
  }
</script>
<h1 class="title">Support CoinPledge</h1>
<p class="page-intro">Your donation supports the project and appears in the public <a href="/donations">donation list</a>.</p>
<form class="box form-panel" onsubmit={donate}><fieldset disabled={disabled}>
  <div class="field"><label class="label" for="donor">Name (optional)</label><input class="input" id="donor" bind:value={name} /></div>
  <div class="field"><label class="label" for="website">Website (optional)</label><input class="input" id="website" bind:value={url} placeholder="https://example.com" /></div>
  <div class="field"><label class="label" for="donation">Donation (ETH)</label><input class="input" id="donation" inputmode="decimal" bind:value={value} required /><p class="help">At least 0.01 ETH. Donations are credited to the current contract owner.</p></div>
  {#if error}<p class="notification is-danger" role="alert">{error}</p>{/if}
  <button type="submit" class="button is-success">Donate</button>
</fieldset></form>

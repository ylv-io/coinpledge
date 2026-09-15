<script lang="ts">
  import { challengeInput, defaultDeadline, errorMessage, sameAddress, type User } from '../lib/model';
  import type { Address } from 'viem';
  import type { WalletSession } from '../lib/wallet';
  let { users, account, session, disabled, onCreated }: { users: User[]; account: Address; session: WalletSession; disabled: boolean; onCreated: () => void } = $props();
  let name = $state('');
  let stake = $state('0.01');
  let mentor = $state('');
  let reward = $state('0');
  let deadline = $state(defaultDeadline());
  let error = $state('');
  async function submit(event: SubmitEvent) {
    event.preventDefault();
    error = '';
    try {
      const input = challengeInput({ name, stake, mentor, reward, deadline }, users, account);
      const confirmed = await session.transact('Challenge creation', (client, sender) => client.write(sender, 'createChallenge', [input.name, input.mentor, input.duration, input.reward], input.stake));
      if (confirmed) onCreated();
    } catch (cause) { error = errorMessage(cause); }
  }
</script>
<h1 class="title">Create a challenge</h1>
<p class="page-intro">Make your goal specific, choose a deadline, and agree on the outcome with your mentor.</p>
<form class="box form-panel" onsubmit={submit}>
  <fieldset disabled={disabled}>
    <div class="field"><label class="label" for="goal">Your goal</label><textarea id="goal" class="textarea" bind:value={name} required placeholder="Run 5 km without stopping"></textarea></div>
    <div class="columns">
      <div class="column field"><label class="label" for="stake">Stake (ETH)</label><input id="stake" class="input" inputmode="decimal" bind:value={stake} required /><p class="help">At least 0.01 ETH. Gas is paid separately.</p></div>
      <div class="column field"><label class="label" for="deadline">Deadline</label><input id="deadline" class="input" type="datetime-local" bind:value={deadline} required /></div>
    </div>
    <div class="field"><label class="label" for="mentor">Mentor</label><div class="select is-fullwidth"><select id="mentor" bind:value={mentor} required><option value="" disabled>Choose a registered mentor</option>{#each users.filter(user => !sameAddress(user.addr, account)) as user}<option value={user.name}>{user.name}</option>{/each}</select></div><p class="help">Your mentor must <a href="/account">register a username</a> before you can select them.</p></div>
    <div class="field"><label class="label" for="reward">Reward budget (ETH)</label><input id="reward" class="input" inputmode="decimal" bind:value={reward} required /><p class="help">Deducted on success or failure. 10% goes to the service; the rest goes to your mentor.</p></div>
    {#if error}<p class="notification is-danger" role="alert">{error}</p>{/if}
    <button class="button is-success" type="submit">Stake and create challenge</button>
  </fieldset>
</form>

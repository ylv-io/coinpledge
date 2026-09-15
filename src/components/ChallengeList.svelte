<script lang="ts">
  import { canResolve, dateLabel, ether, GRACE_PERIOD, userLabel, type Challenge, type User } from '../lib/model';
  import type { Address } from 'viem';
  let { challenges, users, account, timestamp, busy, onResolve }: {
    challenges: Challenge[]; users: User[]; account?: Address; timestamp: bigint;
    busy: boolean; onResolve: (id: bigint, success: boolean) => void;
  } = $props();
</script>

{#each [false, true] as resolved}
  <section class="challenge-group" aria-label={resolved ? 'Challenge history' : 'Active challenges'}>
    <h2 class="title is-4">{resolved ? 'History' : 'Active challenges'}</h2>
    {#each challenges.filter(challenge => challenge.resolved === resolved) as challenge (challenge.id)}
      <article class="box challenge-card">
        <div class="card-heading">
          <h3 class="title is-5">{challenge.name}</h3>
          <span class="tag {challenge.resolved ? challenge.successed ? 'is-success' : 'is-danger' : 'is-light'}">{challenge.resolved ? challenge.successed ? 'Succeeded' : 'Failed' : 'Active'}</span>
        </div>
        <p class="stake">{ether(challenge.value)} <span>ETH staked</span></p>
        <dl class="challenge-details">
          <div><dt>Challenger</dt><dd><a href="/{challenge.user}">{userLabel(challenge.user, users)}</a></dd></div>
          <div><dt>Mentor</dt><dd><a href="/{challenge.mentor}">{userLabel(challenge.mentor, users)}</a></dd></div>
          <div><dt>Deadline</dt><dd>{dateLabel(challenge.startDate + challenge.time)}</dd></div>
          <div><dt>Reward budget</dt><dd>{ether(challenge.mentorFee)} ETH</dd></div>
        </dl>
        {#if !challenge.resolved}<p class="help">The mentor can resolve now. The challenger can also resolve from {dateLabel(challenge.startDate + challenge.time + GRACE_PERIOD)}.</p>{/if}
        {#if canResolve(challenge, account, timestamp)}
          <div class="buttons resolution-actions">
            <button class="button is-success" disabled={busy} onclick={() => onResolve(challenge.id, true)}>Mark succeeded</button>
            <button class="button is-danger is-outlined" disabled={busy} onclick={() => onResolve(challenge.id, false)}>Mark failed</button>
          </div>
        {/if}
        <a class="share-link" href="https://twitter.com/intent/tweet?text={encodeURIComponent(challenge.name)}&url={encodeURIComponent(`${window.location.origin}/${challenge.user}`)}" target="_blank" rel="noopener noreferrer">Share goal on X ↗</a>
      </article>
    {:else}<p class="empty-state">{resolved ? 'Completed challenges will appear here.' : 'No active challenges yet.'}</p>{/each}
  </section>
{/each}

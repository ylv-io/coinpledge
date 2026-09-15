<script lang="ts">
  import { onMount } from 'svelte';
  import artifact from '$contract';
  import logo from './img/logo.png';
  import Account from './components/Account.svelte';
  import ChallengeList from './components/ChallengeList.svelte';
  import Donate from './components/Donate.svelte';
  import Home from './components/Home.svelte';
  import NewChallenge from './components/NewChallenge.svelte';
  import { emptyWallet, WalletSession } from './lib/wallet';
  import { dateLabel, ether, errorMessage, routeFor, safeUrl, shortAddress, type Profile } from './lib/model';

  let pathname = $state(window.location.pathname);
  let route = $derived(routeFor(pathname));
  let wallet = $state(emptyWallet());
  let session = $state<WalletSession>();
  let hasWallet = $state(false);
  let menuOpen = $state(false);
  let viewedProfile = $state<Profile>();
  let profileError = $state('');
  const navigation = [['/challenges', 'My challenges'], ['/mentor', 'Mentoring'], ['/users', 'People'], ['/account', 'Account']];
  let data = $derived(wallet.data);
  let busy = $derived(!!wallet.busy);

  function navigate(path: string) {
    history.pushState(null, '', path);
    pathname = window.location.pathname;
    menuOpen = false;
    window.scrollTo(0, 0);
  }
  function followLink(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest('a');
    if (!link || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin || url.hash) return;
    event.preventDefault();
    navigate(url.pathname + url.search);
  }
  function resolve(id: bigint, success: boolean) {
    void session?.transact('Challenge resolution', (client, account) => client.write(account, 'resolveChallenge', [id, success]));
  }
  onMount(() => {
    const provider = window.ethereum;
    hasWallet = !!provider;
    if (!provider) return;
    const current = new WalletSession(provider, artifact);
    session = current;
    const unsubscribe = current.subscribe(state => { wallet = state; });
    const stop = current.start();
    return () => { stop(); unsubscribe(); };
  });
  $effect(() => {
    const client = wallet.client;
    const address = route.address;
    // Refresh viewed profiles with each dashboard snapshot; ignore late network/route responses.
    const snapshot = wallet.data;
    let active = true;
    viewedProfile = undefined;
    profileError = '';
    if (client && address && snapshot) {
      void client.profile(address).then(profile => { if (active) viewedProfile = profile; })
        .catch(error => { if (active) profileError = errorMessage(error); });
    }
    return () => { active = false; };
  });
</script>

<svelte:window onpopstate={() => { pathname = window.location.pathname; menuOpen = false; }} onclick={followLink} />
<svelte:head><title>{route.page === 'home' ? 'CoinPledge — a promise worth keeping' : `${route.page === 'new' ? 'Create a challenge' : route.page.charAt(0).toUpperCase() + route.page.slice(1)} · CoinPledge`}</title></svelte:head>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <nav class="navbar container" aria-label="Main navigation">
    <div class="navbar-brand">
      <a class="navbar-item brand" href="/" aria-label="CoinPledge home"><img src={logo} alt="" /></a>
      <button class="navbar-burger" class:is-active={menuOpen} aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="navigation" onclick={() => { menuOpen = !menuOpen; }}><span></span><span></span><span></span></button>
    </div>
    <div class="navbar-menu" class:is-active={menuOpen} id="navigation">
      <div class="navbar-start">{#each navigation as [href, label]}<a class="navbar-item" class:is-active={pathname === href} aria-current={pathname === href ? 'page' : undefined} {href}>{label}</a>{/each}</div>
      <div class="navbar-end"><div class="navbar-item"><a class="button is-success is-outlined" href="/new">New challenge</a></div><div class="navbar-item">
        {#if wallet.account}<span class="wallet-badge" title={wallet.account}>{shortAddress(wallet.account)}</span>
        {:else}<button class="button is-success" disabled={!hasWallet || wallet.connecting} onclick={() => session?.connect()}>{wallet.connecting ? 'Connecting…' : 'Connect wallet'}</button>{/if}
      </div></div>
    </div>
  </nav>
</header>
<main id="main" class="container main-content">
  <div class="status-area" aria-live="polite">
    {#if wallet.error}<p class="notification is-danger" role="alert">{wallet.error}</p>{/if}
    {#if wallet.busy}<p class="notification is-info" role="status">{wallet.busy}: {wallet.hash ? 'waiting for confirmation…' : 'review the request in your wallet…'}</p>{/if}
    {#if wallet.notice}<p class="notification is-success" role="status">{wallet.notice}</p>{/if}
    {#if data?.gameOver}<p class="notification is-warning">CoinPledge has shut down. Existing challenges can still resolve and available funds can still be withdrawn.</p>{/if}
    {#if data?.warning}<p class="notification is-warning">{data.warning}</p>{/if}
  </div>
  {#if route.page === 'home'}<Home />
  {:else if route.page === 'notfound'}<section class="section"><h1 class="title">Page not found</h1><a href="/">Return home</a></section>
  {:else if !data || !wallet.account || !session}
    <section class="section connect-prompt"><h1 class="title">{wallet.connecting ? 'Connecting to CoinPledge…' : 'Connect your wallet'}</h1><p>{hasWallet ? 'Connect an Ethereum wallet on a network with a verified CoinPledge deployment to see challenges, people and balances.' : 'Open CoinPledge in a browser with an Ethereum wallet installed, then reload this page.'}</p>{#if hasWallet}<button class="button is-success" disabled={wallet.connecting} onclick={() => session?.connect()}>Connect to continue</button>{/if}<a href="/">Learn how CoinPledge works</a></section>
  {:else}
    <section class="section page-content">
      {#key `${wallet.client?.networkId}:${wallet.account}`}
        {#if route.page === 'new'}<NewChallenge users={data.users} account={wallet.account} {session} disabled={busy || data.gameOver} onCreated={() => navigate('/challenges')} />
        {:else if route.page === 'account'}<Account profile={data.profile} users={data.users} {session} {busy} gameOver={data.gameOver} />
        {:else if route.page === 'donate'}<Donate {session} disabled={busy || data.gameOver} />
        {:else if route.page === 'challenges' || route.page === 'mentor'}
          <div class="page-heading"><h1 class="title">{route.page === 'mentor' ? 'Mentoring' : 'My challenges'}</h1><a class="button is-success" href="/new">New challenge</a></div>
          <ChallengeList challenges={route.page === 'mentor' ? data.profile.mentoring : data.profile.challenges} users={data.users} account={wallet.account} timestamp={data.timestamp} {busy} onResolve={resolve} />
        {:else if route.page === 'users'}
          <h1 class="title">People</h1><p class="page-intro">Registered members who can mentor a challenge.</p><div class="box directory">{#each data.users as user}<a href="/{user.addr}"><strong>{user.name}</strong><span class="address">{user.addr}</span></a>{:else}<p>No usernames registered yet. <a href="/account">Be the first.</a></p>{/each}</div>
        {:else if route.page === 'donations'}
          <h1 class="title">Donations</h1><p class="page-intro">Thank you for supporting CoinPledge. <a href="/donate">Make a donation.</a></p><div class="box donation-list">{#each data.donations as donation (donation.id)}<div><span>{#if safeUrl(donation.url)}<a href={safeUrl(donation.url)} target="_blank" rel="noopener noreferrer">{donation.name || 'Anonymous'} ↗</a>{:else}{donation.name || 'Anonymous'}{/if}<small>{dateLabel(donation.timestamp)}</small></span><strong>{ether(donation.value)} ETH</strong></div>{:else}<p>No donations recorded.</p>{/each}</div>
        {:else if route.page === 'profile'}
          {#if profileError}<p role="alert" class="notification is-danger">{profileError}</p>{:else if viewedProfile}<h1 class="title">{viewedProfile.username || 'Member profile'}</h1><p class="address page-intro">{viewedProfile.address}</p><p class="page-intro">Bonus fund: <strong>{ether(viewedProfile.bonus)} ETH</strong></p><h2 class="title is-3">Challenges</h2><ChallengeList challenges={viewedProfile.challenges} users={data.users} account={wallet.account} timestamp={data.timestamp} {busy} onResolve={resolve} /><h2 class="title is-3">Mentoring</h2><ChallengeList challenges={viewedProfile.mentoring} users={data.users} account={wallet.account} timestamp={data.timestamp} {busy} onResolve={resolve} />{:else}<p role="status">Loading profile…</p>{/if}
        {/if}
      {/key}
    </section>
  {/if}
</main>
<footer class="footer site-footer"><div class="container footer-content"><div><strong>CoinPledge</strong><p>Make a commitment. Keep your word.</p><a href="https://github.com/ylv-io/coinpledge" target="_blank" rel="noopener noreferrer">Source code ↗</a></div><div><a href="/donate">Support the project</a><a href="/donations">All donations</a>{#if data?.donations.length}<p class="help">Top supporters</p>{#each data.donations.slice(0, 3) as donation}<p>{donation.name || 'Anonymous'} · {ether(donation.value)} ETH</p>{/each}{/if}</div><div><p>Public goals. On-chain commitments.</p>{#if wallet.client}<p class="help address">Network {wallet.client.networkId} · Contract {shortAddress(wallet.client.address)}</p>{/if}<p class="help">© CoinPledge · MIT license</p></div></div></footer>

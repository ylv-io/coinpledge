# CoinPledge

CoinPledge is an Ethereum application for public commitments: set a goal, stake
ether, choose a mentor, and let the mentor judge the result. Contracts use
**Solidity 0.8.37 and Foundry**. The browser uses **Svelte 5, TypeScript and Vite 8**,
with **Bun 1.4.2** for dependency installation, scripts, builds and tests. Viem handles ABI encoding and
exact integer amounts; an injected Ethereum wallet provides network access.

## Contract rules

[CoinPledge.sol](contracts/CoinPledge.sol) implements these rules:

1. A mentor registers a unique, immutable, case-sensitive username of 3–32 UTF-8
   bytes. Challengers may also register, but registration is not required to stake.
2. A challenger supplies a goal, a different registered mentor, a positive duration
   in seconds, and at least **0.01 ETH**. The mentor reward cannot exceed the stake.
3. The mentor can resolve immediately, even before the deadline. The challenger
   can also resolve **at or after deadline + seven days**. Other addresses cannot.
4. On either outcome, the reward is deducted from the stake. The owner receives
   `floor(reward / 10)` wei; the mentor receives the rest. No rounding dust is lost.
5. Success credits the remaining stake plus `floor(bonusFund / 2)` wei. A bonus
   fund at or below **0.001 ETH** is released completely. Failure adds the remaining
   stake to the challenger's bonus fund.
6. Settlement **credits a withdrawal balance** instead of transferring ETH to
   recipients. Collect payouts, mentor rewards, service fees, and donations through
   **Account → Withdraw to wallet** or `withdraw()`. Smart wallets that reject ETH
   can call `withdrawTo(recipient)` to claim their own funds to another address.

A rejecting recipient cannot block settlement or another recipient's withdrawal.
Withdrawals clear balances before the external call and use OpenZeppelin's
transient reentrancy guard. Builds and tests target **Osaka**, Ethereum mainnet's
execution-layer fork in Fusaka, including EIP-1153 transient storage.

The owner can permanently call `gameOver()` to stop new challenges, registrations,
and donations. **Existing challenges can still resolve under the same timing and
permission rules.** Bonus funds become withdrawable immediately after shutdown;
unresolved stakes must still be resolved. There is no owner sweep of user funds.
Ownership transfers require the recipient to call `acceptOwnership()`.
Renouncing ownership is disabled so shutdown and fee attribution remain available.
Donations and service fees belong to the owner at the time they are credited;
transferring ownership does not transfer previously accrued balances.

## Migration from the 2018 contract

This is a **new deployment**, not an upgrade of existing on-chain contracts.
Historical balances and challenges are not migrated, and this source cannot
change the behavior of historical deployments. The tracked browser artifact has
no deployment addresses until a deployment of this revision is verified and
registered. Do not copy old mainnet, Ropsten, or Ganache addresses into it.

The challenge tuple, including the `successed` spelling, and all existing events
retain their ABI types and order. Deliberate changes are withdrawal-based payouts,
continued resolution after shutdown, exact fee/bonus rounding, custom errors,
empty arrays for users with no challenges, two-step ownership, and removal of the
old OpenZeppelin `isOwner()` helper (compare `owner()` instead). Storage is not
compatible with the old contract. Per-user/per-mentor indexes avoid scanning every
challenge when reading an account's history.

## Repository layout

| Path | Purpose |
| --- | --- |
| `contracts/CoinPledge.sol` | Rules, accounting, ownership and withdrawals |
| `foundry.toml`, `foundry.lock`, `lib/` | Compiler settings and pinned dependency submodules |
| `test/` | Forge unit, fuzz and stateful invariant tests |
| `script/DeployCoinPledge.s.sol` | Deployment using an explicitly selected Foundry signer |
| `scripts/` | Artifact export, export tests and local wallet/browser integration check |
| `deployments/CoinPledge.json` | Verified deployment manifest; initially empty |
| `build/contracts/CoinPledge.json` | Generated browser ABI, bytecode and network addresses |
| `src/lib/` | Typed contract adapter, wallet lifecycle, amount and permission rules |
| `src/App.svelte`, `src/components/` | Svelte pages, forms, challenges and account withdrawals |
| `tests/unit/`, `tests/browser/` | Bun unit tests and Playwright browser checks |
| `index.html`, `public/404.html`, `src/app.css` | Maintained page entry, static hosting fallback and styles |
| `bun.lock`, `.bun-version`, `bunfig.toml` | Locked dependencies, Bun version and runtime configuration |
| `dist/` | Generated static site, including HTML, bundles and logo |

Truffle, its wallet provider, migration contracts and Mocha contract tests have
been removed, along with React/Redux, Web3 0.20, Webpack, Babel, node-sass and Jest. There is no application server or database.

## Contract development

Install [Foundry](https://getfoundry.sh/introduction/installation/), then select
**v1.8.1**, the version used by CI:

```sh
foundryup --install v1.8.1
forge install
forge build
forge test
forge fmt --check
```

`forge install` initializes the pinned submodules: OpenZeppelin Contracts
**v5.7.0** and forge-std **v1.16.2**. Solidity **0.8.37**, the Osaka EVM target,
optimizer settings and explicit remappings are pinned in `foundry.toml`.
Osaka is the execution-layer fork active on Ethereum mainnet as of September 14,
2026 ([Fusaka](https://ethereum.org/roadmap/fusaka/)). Forge tests and scripts enable
the EIP-7825 transaction gas cap and use a gas limit of **16,777,216**.
The compiler is downloaded automatically; no global `solc`, Node, npm, Truffle,
RPC credentials, or running chain is needed for the Forge tests. Solidity 0.8.37
is the [stable release verified for this migration](https://www.soliditylang.org/blog/2026/09/10/solidity-0.8.37-release-announcement/).

Tests cover tuple/events, creation validation, authorization, exact deadline
boundaries, fees, bonuses, ownership, shutdown, smart-wallet failures and
reentrancy. Fuzz tests check wei conservation; stateful invariants exercise
creation, settlement, donation, withdrawal and shutdown in varying orders.

With Bun available, export the compiled artifact for the browser:

```sh
bun scripts/export-contract.js
bun scripts/test-export-contract.js
```

`bun run compile` is shorthand for `forge build` followed by the export.
The exporter generates legacy Web3 `constant`/`payable` flags from the modern ABI
and rejects manifest entries whose bytecode differs from the current build.
Review and commit generated artifact changes with their corresponding source.

## Local deployment and browser development

In one terminal, start an isolated chain:

```sh
anvil --host 127.0.0.1 --port 8545 --chain-id 31337 \
  --hardfork osaka --enable-tx-gas-limit
```

In another terminal, use the first **public account address printed by Anvil** as
`LOCAL_DEPLOYER` below. The unlocked-account option is for this local test chain:

```sh
LOCAL_DEPLOYER=0xYourAnvilAccountAddress
forge script script/DeployCoinPledge.s.sol:DeployCoinPledge \
  --rpc-url http://127.0.0.1:8545 --sender "$LOCAL_DEPLOYER" --unlocked --broadcast
```

The script deploys CoinPledge with the selected sender as owner. Use its printed
contract address as `LOCAL_CONTRACT` to register the deployment:

```sh
LOCAL_CONTRACT=0xYourDeployedContractAddress
bun scripts/export-contract.js \
  --rpc-url http://127.0.0.1:8545 --address "$LOCAL_CONTRACT"
```

Registration reads `net_version` and compares `eth_getCode` with Forge's compiled
runtime before writing the manifest and browser artifact. It sends no transaction.
After resetting Anvil, redeploy and register again. After changing contract code,
redeploy each configured network or remove its stale manifest entry before export.
Local deployment addresses are disposable; do not commit them as public releases.

For public deployments, review this new contract first, select an Osaka-compatible
chain, and supply an explicit RPC URL and a Foundry keystore/hardware-wallet signer
(e.g. `--account NAME`). Omitting `--broadcast` simulates the deployment. No keys or
public RPC credentials are stored in the deployment script. Local validation and
CI never deploy to a public network.

### Svelte frontend development

Install [Bun](https://bun.com/docs/installation) **1.4.2**, matching `.bun-version`
and `package.json`. The frontend no longer needs Node 10 or npm.

```sh
bun install --frozen-lockfile
bun run dev
```

Open `http://127.0.0.1:5173` with an Ethereum browser wallet on the same Anvil chain,
then choose **Connect wallet**. The app uses `window.ethereum` (EIP-1193), checks
network ID and deployed runtime bytecode, and clears/reloads account data when the
wallet changes account, changes network or disconnects. It polls fresh chain
snapshots every five seconds. Wallet rejection, failed transactions, unconfigured
networks and stale deployments are shown explicitly. No public RPC or historical
contract address is assumed. Without a wallet, the landing page remains available.

The familiar green-and-white interface includes challenge creation, active/history
views, mentoring, username registration, bonus and withdrawal balances, profiles,
the member directory and donations. ETH values stay decimal strings in forms and
`bigint` in the adapter. Svelte escapes user text; donation links permit only HTTP(S).
The challenger receives resolution controls at the contract's seven-day boundary.

`bun.lock` is the only dependency lockfile. Use `bun install` when deliberately
changing dependencies and commit the resulting lockfile. Dependencies are pinned;
TypeScript 6 matches the supported range of `svelte-check`. `bunfig.toml` runs
package scripts under Bun, including tools with Node shebangs. Build and preview
with `bun run build` and `bun run preview`.

## Validation and generated outputs

| Command | Purpose |
| --- | --- |
| `forge test` / `bun run test:contracts` | Contract unit, fuzz and invariant tests |
| `forge fmt --check` | Solidity formatting |
| `forge lint contracts/CoinPledge.sol` | Contract lint diagnostics for manual review |
| `bun run test:artifacts` | Standalone exporter checks |
| `bun run check` | Strict TypeScript, Svelte and accessibility diagnostics |
| `bun test` | Amount, permission, wallet lifecycle and contract adapter unit tests |
| `bun run build` | Regenerate the production static site |
| `git diff --check` | Whitespace validation |

Install Chromium once for the browser checks (`--with-deps` also installs required
system packages on Linux):

```sh
bunx --bun playwright install chromium
```

For an end-to-end check, start a **separate** Anvil instance with the same Osaka
rules and transaction gas cap used by CI:

```sh
anvil --host 127.0.0.1 --port 18545 --chain-id 31337 \
  --hardfork osaka --enable-tx-gas-limit
```

Then run `bun run test:integration` in another terminal. The local chain uses
network/chain ID 31337 and mainnet's EVM rules; it does not fork mainnet state.
The check deploys through the Forge script, verifies the export, and exercises the
new adapter's calls, event and tuple decoding, settlement and withdrawals with
exact wei values. It then launches Chromium against the Svelte app and tests wallet
connection, registration, challenge creation, mentor resolution, withdrawals,
donations, profiles, network/account changes, deep links and mobile layouts.
It also checks failed stakes, challenger resolution after the grace period, bonus
release, shutdown and withdrawals after shutdown.
`bun run test:browser` is the internal browser entry point; use `test:integration`
to supply its verified temporary deployment and unlocked local test accounts.
`COINPLEDGE_TEST_RPC_URL` can override the local URL; the check rejects nonlocal
hosts and non-Anvil/non-31337 networks. It does not edit the tracked deployment
manifest or browser artifact. CI runs this check in addition to contract and
frontend tests and builds.

`out/`, `cache/` and `broadcast/` are disposable ignored Foundry outputs.
`build/contracts/CoinPledge.json` and frontend bundles are tracked generated
outputs. Never hand-edit their ABI, bytecode or bundles. Production builds omit
source maps; the development server supports source debugging. Generate
flattened Solidity on demand with `forge flatten contracts/CoinPledge.sol`; a
duplicate flattened source file is not part of the build or CI.
Vite recreates all of `dist/`: edit `index.html`, `public/404.html` and source files,
then rebuild. The maintained 404 fallback restores deep links on a root/custom-domain
GitHub Pages site; other static hosts should route unknown paths to `index.html`.
Keep generated `dist/` output tracked, including `404.html`. Browser reports and
traces in `test-results/` and `playwright-report/` are ignored.

## Remaining maintenance caveats

- The deleted `truffle.js` contained committed wallet and RPC credentials. Their
  deletion does not erase Git history. Never fund or reuse that wallet; replace
  any credentials still in use.
- The legacy website publisher and its destructive source-deletion hook have been
  removed. `bun run build` produces the static site in `dist/`; publishing that
  directory requires a separately configured hosting workflow.

See [AGENTS.md](AGENTS.md) for repository-specific agent guidance.

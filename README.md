# CoinPledge

CoinPledge is an Ethereum application for public commitments: set a goal, stake
ether, choose a mentor, and let the mentor judge the result. Contracts use
**Solidity 0.8.37 and Foundry**. The browser remains a React 16/Redux application
with Web3 0.20; upgrading that legacy frontend stack is a separate project.

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
| `scripts/` | Artifact export, export tests and local Web3 integration check |
| `deployments/CoinPledge.json` | Verified deployment manifest; initially empty |
| `build/contracts/CoinPledge.json` | Generated browser ABI, bytecode and network addresses |
| `src/js/services/web3/` | Web3 callback adapter, contract calls, polling and events |
| `src/js/components/` | React UI, including account withdrawals |
| `src/js/tests/` | Jest/Enzyme frontend tests |
| `dist/` | Maintained site HTML and generated bundles, source maps and flattened Solidity |

Truffle, its wallet provider, migration contracts and Mocha contract tests have
been removed. The browser uses Web3 directly through a small promise adapter;
there is no application server or database.

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

With Node available, export the compiled artifact for the browser:

```sh
node scripts/export-contract.js
node scripts/test-export-contract.js
forge flatten contracts/CoinPledge.sol --output dist/Complete.sol
```

`npm run compile` is shorthand for `forge build` followed by the export.
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
node scripts/export-contract.js \
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

### Legacy frontend environment

The frontend's existing lockfile remains **npm format 1**. Local checks for this
migration used **Node 10.24.1 / npm 6.14.12**; the frontend CI job uses Node 10.24.1.
This is an end-of-life compatibility environment for the existing Webpack 3,
Babel 6, node-sass 4 and Jest 23 stack, not a modern supported Node target.
The contract toolchain and standalone export scripts do not depend on that stack.

In that frontend environment:

```sh
npm ci
npm run serve -- --host 127.0.0.1 --port 8080
```

Open `http://127.0.0.1:8080` with a funded local test account on the same Anvil chain.
The wallet adapter still requires injected legacy `web3.currentProvider` and
synchronous account access. Wallets exposing only `window.ethereum` need a
separate adapter update. Reload the page after switching networks: account polling
and cached contract/event subscriptions do not fully handle network changes.

## Validation and generated outputs

| Command | Purpose |
| --- | --- |
| `forge test` / `npm run test:contracts` | Contract unit, fuzz and invariant tests; no external chain |
| `forge fmt --check` | Solidity formatting |
| `forge lint contracts/CoinPledge.sol` | Contract lint diagnostics for manual review |
| `npm run test:artifacts` | Standalone exporter checks; Node only |
| `npm test -- --runInBand` | Frontend tests only, selected by `jest.config.json` |
| `./node_modules/.bin/eslint src/js scripts` | JavaScript lint; no npm lint script |
| `npm run build` | Regenerate production frontend bundles and source maps |
| `git diff --check` | Whitespace validation |

For an end-to-end check, start a **separate** Anvil instance with the same Osaka
rules and transaction gas cap used by CI:

```sh
anvil --host 127.0.0.1 --port 18545 --chain-id 31337 \
  --hardfork osaka --enable-tx-gas-limit
```

Then run `npm run test:integration` in another terminal. The local chain uses
network/chain ID 31337 and mainnet's EVM rules; it does not fork mainnet state.
The check deploys through the Forge script, verifies the export, and exercises the
Web3 adapter's calls, event and tuple decoding, settlement and withdrawals with
exact wei values.
`COINPLEDGE_TEST_RPC_URL` can override the local URL; the check rejects nonlocal
hosts and non-Anvil/non-31337 networks. It does not edit the tracked deployment
manifest or browser artifact. CI runs this check in addition to contract and
frontend tests and builds.

`out/`, `cache/` and `broadcast/` are disposable ignored Foundry outputs.
`build/contracts/CoinPledge.json`, `dist/Complete.sol`, frontend bundles and source
maps are tracked generated outputs. Never hand-edit their ABI, bytecode or bundles.
Preserve `dist/index.html` and `dist/404.html`; Webpack does not recreate them.

## Remaining maintenance caveats

- The deleted `truffle.js` contained committed wallet and RPC credentials. Their
  deletion does not erase Git history. Never fund or reuse that wallet; replace
  any credentials still in use.
- `npm run deploy` is the historical **website** publisher, with `noprompt: true`
  and a destructive `clean-source` post hook. `npm run clean-source` deletes source
  and configuration. Neither is a contract deployment or validation command.
  Review that workflow before any website publication.
- Historical explorer links in the UI may still point to Ropsten or the old mainnet
  deployment. They do not identify a deployment of the new contract.
- [LICENSE](LICENSE) is MIT and Solidity headers follow it, while `package.json`
  still declares ISC. The maintainer must resolve this existing metadata mismatch.

See [AGENTS.md](AGENTS.md) for repository-specific agent guidance.

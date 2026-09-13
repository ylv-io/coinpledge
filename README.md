# CoinPledge

CoinPledge is an Ethereum application for public commitments: set a goal, stake
ether, choose a mentor, and let the mentor judge the result. The browser UI uses
React and Redux; challenge rules and funds are managed by a Solidity contract.

This checkout contains a legacy toolchain and tracked deployment artifacts from
2018. These instructions describe the checked-in source and configuration; they
do not establish that a historical deployment or website is currently usable.

## How challenges work

The rules below come from [CoinPledge.sol](contracts/CoinPledge.sol):

1. A mentor registers a unique username of 3–32 bytes. The UI also lets challengers
   register through `/account`.
2. A challenger supplies a goal, a different registered mentor, a positive duration,
   and at least **0.01 ETH**. The mentor reward cannot exceed the stake.
3. The mentor can resolve the challenge immediately, including before its deadline.
   Once the deadline plus seven days has passed, the challenger can also resolve it.
4. On either outcome, the reward is deducted from the stake: nominally 90% goes to
   the mentor and 10% to the contract owner, subject to integer rounding. A zero
   reward produces no service fee; blockchain transactions still consume gas.
5. Success returns the remaining stake plus nominally half the challenger's bonus
   fund. If the bonus fund is at most **0.001 ETH**, all of it is returned.
   Failure adds the remaining stake to that challenger's bonus fund.

The owner can permanently call `gameOver()`, disabling challenge creation and
resolution, username registration, and donations. Afterward, `withdraw()` returns
only a caller's bonus fund. There is no withdrawal path for unresolved challenge
stakes in this contract. Donations are forwarded to the owner.

## Repository layout

| Path | Purpose |
| --- | --- |
| `contracts/` | CoinPledge and Truffle migration contracts |
| `migrations/` | Deployment sequence: migration bookkeeping, then CoinPledge |
| `test/contracts/` | Truffle/Mocha contract tests using Chai and OpenZeppelin helpers |
| `src/js/app.js` | Browser entry point; initializes Redux and wallet polling |
| `src/js/routers/` | React Router routes |
| `src/js/components/` | Pages, forms, and shared UI |
| `src/js/actions/`, `reducers/`, `selectors/`, `store/` | Redux state and derived data |
| `src/js/services/web3/` | Wallet access, contract calls, polling, and event subscriptions |
| `src/js/utils/` | Challenge tuple conversion and shared helpers |
| `src/js/tests/` | Jest/Enzyme frontend tests and snapshots |
| `src/css/`, `src/img/` | Styles and source images |
| `build/contracts/` | Tracked Truffle artifacts, including ABI and network deployments |
| `dist/` | Tracked site HTML, bundles, styles, source maps, and flattened Solidity |

The frontend imports `build/contracts/CoinPledge.json` and uses
`truffle-contract`'s `deployed()` to select a deployment for the wallet's network.
`pull.js` initializes account data and polls for account changes; `events.js`
updates Redux from contract events. There is no separate application server or
database in this repository.

## Local development

### Toolchain prerequisites

The version-1 npm lockfile records Truffle **4.1.14**, Solidity compiler **0.4.24**,
OpenZeppelin **2.0.0**, Web3 **0.20.7**, Webpack **3.12.0**, node-sass **4.10.0**,
and Jest **23.6.0**. The UI uses React 16, Redux 4, Babel 6, and Bulma.

There is no pinned Node runtime or verified compatibility matrix. Dependency
installation, native node-sass compilation, and browser wallet integration need
validation in a compatible legacy environment. Do not assume a current Node
installation works, or upgrade the lockfile as part of an unrelated change.

Install the locked dependencies in that environment:

```sh
npm ci
```

A local Ethereum JSON-RPC chain must be running at **127.0.0.1:7545**, as configured
by the `dev` network in [truffle.js](truffle.js). Supply a compatible local chain
separately; there is no npm script that starts one. Use funded local test accounts.

### Compile, migrate, and serve

From the repository root, after dependencies and the local chain are ready:

```sh
./node_modules/.bin/truffle compile
./node_modules/.bin/truffle migrate --network dev
npm run serve -- --host 127.0.0.1 --port 8080
```

Open `http://127.0.0.1:8080`. The development server serves the HTML in `dist/`
and supports client-side route fallback. The wallet must use the same local chain
as the migration. After resetting that chain, redeploy with
`./node_modules/.bin/truffle migrate --reset --network dev` and reload the browser.

The wallet adapter currently requires an injected legacy `web3.currentProvider`
and synchronous account access. The `window.ethereum` initialization is commented
out, so connecting a wallet that exposes only that interface requires code changes.
Network switching is not explicitly handled, and the contract instance is cached.

Local UI routes include `/account`, `/new`, `/challenges`, `/mentor`, `/users`,
`/donate`, `/donations`, and `/:id` for a user's page.

## Checks and builds

| Command | Purpose / prerequisites |
| --- | --- |
| `npm test -- --runInBand` | Frontend Jest tests; uses `jest.config.json` and Enzyme setup |
| `./node_modules/.bin/truffle test test/contracts/*.js --network dev` | Contract tests; requires the local chain and funded accounts |
| `./node_modules/.bin/eslint src/js test/contracts migrations` | Invoke the existing ESLint configuration directly; no lint script is defined |
| `npm run build` | Production frontend bundle and source maps in `dist/`; does not compile or deploy contracts |
| `./node_modules/.bin/truffle compile` | Compile Solidity and refresh artifacts in `build/contracts/` |

Frontend and contract tests use separate runners; `npm test` does not run the
contract suite. The package's inline Jest `moduleNameMapper` is separate from
the explicitly selected `jest.config.json`; do not assume those settings merge.
Webpack's ESLint loader is commented out, so a build does not establish lint success.

Review `git diff` after compiling, migrating, or building: both `build/` and `dist/`
contain tracked files. Edit application source under `src/` and contracts under
`contracts/`, then regenerate the corresponding outputs. Preserve `dist/index.html`
and `dist/404.html`; Webpack does not recreate these site entry and routing files.

## Maintenance caveats

- **Committed credentials:** `truffle.js` contains a hardcoded wallet mnemonic and
  RPC project credentials. Treat the mnemonic as exposed; never fund or reuse it.
  Replace credential handling before any public-network deployment. Deleting a
  literal from the current file does not remove it from Git history. The current
  configuration does not read environment variables or load `.env`.
- **Deployment side effects:** `npm run deploy` invokes `gh-pages-deploy` with
  `dist/`, a historical custom domain, `noprompt: true`, and a `clean-source` post
  hook. `npm run clean-source` deletes source, contracts, package manifests,
  configuration, README, and build directories. Review or replace this workflow
  before publishing; neither command is a development or validation step.
- **Misnamed compile script:** `npm run compile` flattens Solidity to
  `dist/Bundle.sol`; it does not compile bytecode. Its `truffle-flattener` executable
  is absent from both the manifest and lockfile. Use Truffle for contract compilation.
- **Historical networks:** `truffle.js` includes `ropsten` and `main` configurations,
  while the checked-in CoinPledge artifact records network IDs `1`, `3`, and `5777`.
  Those records are not proof of a usable deployment. Some UI explorer links are
  hardcoded to Ropsten. Use `--network dev` explicitly for local work.
- **License mismatch:** [LICENSE](LICENSE) contains the MIT license, while
  `package.json` declares ISC. Resolve that discrepancy with the maintainer before
  making a definitive package licensing claim.

See [AGENTS.md](AGENTS.md) for repository-specific guidance for coding agents.

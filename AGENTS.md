# Guidance for coding agents

## Scope and orientation

This file applies to the CoinPledge repository. It is a standalone Git repository;
run Git commands from this checkout, not through the home-directory dotfiles repo.
Read [README.md](README.md), `package.json`, and the relevant configuration before
changing setup or documenting commands.

CoinPledge is a legacy React 16/Redux browser app backed by a Solidity 0.4.24
contract. The lockfile uses npm format 1, Truffle 4, Web3 0.20, Webpack 3, Babel 6,
and node-sass 4. There is no pinned Node version, CI workflow, or verified modern
runtime support in the checkout. Keep toolchain modernization separate from
unrelated fixes, and preserve `package-lock.json` unless dependencies must change.

## Where to make changes

- UI and forms: `src/js/components/`; routes: `src/js/routers/AppRouter.js`.
- State: `src/js/actions/`, `reducers/`, `selectors/`, and `store/configureStore.js`.
- Blockchain integration: `src/js/services/web3/`; tuple conversion:
  `src/js/utils/web3.js`.
- Contract behavior: `contracts/CoinPledge.sol`; deployment: `migrations/` and
  `truffle.js`.
- Frontend tests: `src/js/tests/`; contract tests: `test/contracts/`.
- Styling: `src/css/index.css` and existing Bulma classes.

Follow the existing JavaScript style (two-space indentation, single quotes,
semicolons, ES module imports in the frontend and CommonJS in Truffle files).
Consult `.eslintrc.js` for project exceptions to Airbnb style. Avoid wholesale
formatting, new frameworks, or unrelated refactors.

## Contract and frontend coupling

The browser imports `build/contracts/CoinPledge.json`; deployment lookup depends
on its network metadata. Changes to ABI, events, or the `Challenge` tuple require
checking service calls, event handlers, tuple conversion, and affected tests.
Preserve the existing `successed` field spelling where it is part of that interface.

Contract values are wei, while UI inputs and displays also use ether. Challenge
creation in the UI converts a deadline to a duration in seconds. Preserve these
boundaries and avoid introducing floating-point conversions for on-chain amounts.
Check the implementation for fee rounding, mentor permissions, the seven-day
self-resolution threshold, bonus payouts, and owner shutdown behavior before
changing or describing them.

Wallet access uses legacy injected `web3`, synchronous account lookup, and a cached
contract instance. Do not assume `window.ethereum` initialization or network-change
handling exists. Account polling lives in `pull.js`; event updates live in `events.js`.

## Generated and tracked files

`build/contracts/` and frontend bundles, styles, and source maps in `dist/` are
tracked outputs. Do not hand-edit generated ABI, bytecode, bundles, or source maps.
Regenerate them only when the task needs it and inspect the resulting diff,
including deployment metadata. Do not delete or blanket-ignore `build/` or `dist/`:
the frontend needs the artifact, and `dist/index.html` and `dist/404.html` are
maintained site files that Webpack does not recreate.

## Validation

After dependencies are available, use checks appropriate to the change:

- Frontend: `npm test -- --runInBand`; production build: `npm run build`.
- Contracts: `./node_modules/.bin/truffle compile`, then
  `./node_modules/.bin/truffle test test/contracts/*.js --network dev` with a local
  chain on `127.0.0.1:7545`. These tests are not run by Jest.
- JavaScript lint: `./node_modules/.bin/eslint src/js test/contracts migrations`.
  There is no npm lint script, and Webpack's lint loader is disabled.
- Documentation: verify commands, paths, and behavior against source, then run
  `git diff --check`; installing the legacy stack is unnecessary for prose changes.

The frontend test command selects `jest.config.json`; the inline Jest settings in
`package.json` are not automatically merged into it. Do not overwrite snapshots
just to make tests pass. Report missing dependencies, chain access, or runtime
compatibility failures accurately rather than claiming unexecuted checks passed.

## Commands and credentials requiring care

- Do not use `npm run clean-source` as cleanup: it deletes the repository's source
  and configuration. `npm run deploy` publishes through `gh-pages-deploy` and
  invokes that destructive post hook with prompts disabled. Only use deployment
  workflows when publishing is part of the user's task, after reviewing the hooks.
- `npm run compile` is a Solidity flattening script with an undeclared executable,
  not the contract compiler. Use the local Truffle binary for compilation.
- Use `--network dev` explicitly for local migrations and contract tests. Public
  network transactions and wallet operations are not routine validation.
- `truffle.js` contains committed wallet and RPC credentials. Do not copy their
  values into documentation, logs, fixtures, or new configuration. Treat the wallet
  mnemonic as exposed and never reuse it. There is no existing `.env` loader.
- Do not claim the contract has no owner controls or that shutdown refunds all
  stakes: `gameOver()` disables resolution and `withdraw()` only returns bonus funds.
- Keep the MIT `LICENSE` / ISC package metadata discrepancy visible until the
  maintainer resolves it; do not choose a license as an incidental cleanup.

Keep README commands and these instructions aligned with any workflow changes.

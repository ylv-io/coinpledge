# Guidance for coding agents

## Scope and orientation

This file applies to the standalone CoinPledge Git repository. Run Git commands
from this checkout, not through the home-directory dotfiles repo. Read README.md,
package.json, foundry.toml and relevant configuration before changing workflows.

Contracts use Solidity 0.8.37 and Foundry v1.8.1, with pinned OpenZeppelin v5.7.0
and forge-std v1.16.2 submodules. The EVM target is Osaka, Ethereum mainnet's
execution-layer fork in Fusaka as of September 14, 2026. Keep EIP-7825 transaction
gas-limit checks enabled in Forge and Anvil; Forge's gas limit is 16,777,216.
The transient reentrancy guard requires EIP-1153, which Osaka supports. Keep explicit
remappings and foundry.lock aligned with submodule revisions; do not update
dependencies incidentally.

The React 16/Redux frontend is still legacy: Web3 0.20, Webpack 3, Babel 6,
node-sass 4, Jest 23, and npm lockfile format 1. Node 10.24.1/npm 6.14.12 was used
for local frontend checks; Node 10 is end of life. Keep frontend toolchain upgrades
separate from contract work. Preserve retained lockfile versions unless necessary.

## Where to make changes

- Contract: contracts/CoinPledge.sol; deployment: script/DeployCoinPledge.s.sol.
- Forge tests: test/*.t.sol and test/helpers/; dependencies: lib/ git submodules.
- Artifact/registration and integration scripts: scripts/.
- Verified deployments: deployments/CoinPledge.json; initially empty.
- UI/forms: src/js/components/; routes: src/js/routers/AppRouter.js.
- State: src/js/actions/, reducers/, selectors/, store/configureStore.js.
- Web3 adapter, contract calls, polling/events: src/js/services/web3/.
- Challenge tuple conversion: src/js/utils/web3.js.
- Frontend tests: src/js/tests/; styling: src/css/index.css and Bulma classes.

Use two-space indentation, single quotes and semicolons in JavaScript; consult
.eslintrc.js. Solidity formatting is defined by forge fmt. Avoid new frameworks,
wholesale formatting, or unrelated refactors.

## Contract behavior and frontend coupling

This rewrite requires a new deployment. It is not a proxy upgrade and cannot
change historical balances or stakes. Do not reuse historical deployment addresses
or claim that deploying migrates existing user funds.

The browser imports build/contracts/CoinPledge.json and uses native Web3 through
contract.js's promise adapter. Preserve function input/output types, event argument
names/indexing, Challenge tuple order, and the historical successed spelling.
Changes must be checked against service calls, event handlers and tuple conversion.

Contract amounts are wei. Convert user-facing ether with decimal strings or
BigNumber objects, never a JavaScript number. UI deadlines become durations in
seconds. A mentor may resolve immediately; a challenger may also resolve at or
after deadline + seven days. No other caller may resolve.

Fees use floor(reward / 10) for the owner and the remainder for the mentor. Success
credits remaining stake plus floor(bonus / 2), or the entire bonus at or below
0.001 ETH. Failure adds the remaining stake to the user's bonus fund. Settlement
and donations only credit pendingWithdrawals; withdraw()/withdrawTo() transfer ETH
using checks-effects-interactions and a transient reentrancy guard. Never make a
recipient's receive hook part of settlement again.

gameOver() permanently stops new challenges, registration and donations. Existing
challenges can still resolve. Bonuses unlock for withdrawal after shutdown;
unresolved stakes still require resolution. Ownership transfer requires acceptance,
renunciation is disabled, and accrued funds remain with their original recipient.

The browser requires legacy injected web3 and synchronous account lookup. It does
not support ethereum-only injection or fully handle network changes. Preserve or
explicitly replace these assumptions; reload after changing networks.

## Generated and tracked files

Never hand-edit build/contracts/CoinPledge.json, dist/Complete.sol, bundles or maps.
Use forge build, node scripts/export-contract.js, forge flatten, and npm run build.
The exporter uses deployments/CoinPledge.json and refuses stale bytecode. Register
a deployment with --rpc-url and --address only after deploying the current build;
it verifies runtime bytecode and network ID. Keep local addresses out of public
release commits. Never attach the new ABI to a historical contract.

out/, cache/ and broadcast/ are ignored Foundry outputs. build/contracts/ and dist/
contain tracked outputs; do not delete or blanket-ignore those directories.
dist/index.html and dist/404.html are maintained site files Webpack does not create.

## Validation

Contract checks need Foundry and pinned submodules, not npm or a running chain:

- forge install
- forge fmt --check
- forge build
- forge test (unit, fuzz and stateful accounting invariants)
- forge lint contracts/CoinPledge.sol (review intentional timestamp/withdrawal diagnostics)

With Node available: node scripts/export-contract.js and
node scripts/test-export-contract.js. Regenerate flattened source with
forge flatten contracts/CoinPledge.sol --output dist/Complete.sol. Verify generated
outputs match source and inspect deployment metadata.

Frontend checks in the compatible legacy environment:

- npm ci
- npm test -- --runInBand
- ./node_modules/.bin/eslint src/js scripts
- npm run build

For the actual Forge-to-Web3 integration, start a separate local Anvil at
127.0.0.1:18545, chain/network 31337, with --hardfork osaka --enable-tx-gas-limit,
then npm run test:integration. This tests mainnet EVM rules on a local chain without
forking mainnet state. The script broadcasts only to a verified local Anvil instance
and uses its unlocked test accounts. It does not alter tracked deployment records.
Never use public network transactions or wallet operations as routine validation.

Jest uses jest.config.json, whose roots/testMatch restrict discovery to frontend
source/tests so vendored OpenZeppelin tests are excluded. Package-inline Jest
settings are not merged. Do not overwrite snapshots just to make tests pass.
Webpack lint is disabled. Report any unexecuted checks or runtime failures.
Run git diff --check for all changes; installing the frontend is unnecessary for
prose-only changes. CI pins Foundry and checks contracts, generated artifacts,
frontend tests/build, and the local integration path.

## Commands and credentials requiring care

- npm run build produces the static site in dist/. There is no website publishing
  script; configure hosting separately when publication is requested. Never add
  source-deletion hooks to a build or publishing workflow.
- npm run compile now runs forge build and exports the browser artifact.
  npm run flatten:contracts generates dist/Complete.sol. Truffle is no longer used.
- Select explicit RPC URLs and signers for Forge scripts. --broadcast sends actual
  transactions. Local work uses isolated Anvil accounts, never public signers.
- The deleted truffle.js exposed a mnemonic and RPC credentials in Git history.
  Never reuse that wallet or copy those credentials into new files/logs. Public
  deployments should use a Foundry keystore or hardware wallet and supplied RPC URL.
- Keep the MIT LICENSE / ISC package metadata discrepancy visible until the
  maintainer resolves it; do not select a new license as incidental cleanup.

Keep README.md and these instructions aligned with workflow changes.

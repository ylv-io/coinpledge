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

The frontend uses Svelte 5, TypeScript 6, Vite 8 and Viem 2. Bun 1.4.2 is the
package manager and script/test runtime, pinned in `.bun-version` and `package.json`.
Use `bun.lock`; do not add npm/yarn lockfiles. Preserve pinned dependencies unless
an update is part of the task. TypeScript must remain compatible with svelte-check.

## Where to make changes

- Contract: contracts/CoinPledge.sol; deployment: script/DeployCoinPledge.s.sol.
- Forge tests: test/*.t.sol and test/helpers/; dependencies: lib/ git submodules.
- Artifact/registration and integration scripts: scripts/.
- Verified deployments: deployments/CoinPledge.json; initially empty.
- UI/forms: src/App.svelte and src/components/*.svelte.
- Wallet connection and reactive snapshots: src/lib/wallet.ts.
- EIP-1193 RPC, ABI encoding, contract calls and event decoding: src/lib/contract.ts.
- Exact amounts, tuple model, permissions and form validation: src/lib/model.ts.
- Frontend tests: tests/unit/ and tests/browser/; styles: src/app.css and Bulma CSS.
- Site entry/fallback: index.html and public/404.html; build config: vite.config.mts.

Use two-space indentation, single quotes and semicolons in TypeScript/JavaScript.
Use Svelte 5 runes, typed props and accessible native controls. Solidity formatting
is defined by forge fmt. Avoid unrelated refactors and dependency upgrades.

## Contract behavior and frontend coupling

This rewrite requires a new deployment. It is not a proxy upgrade and cannot
change historical balances or stakes. Do not reuse historical deployment addresses
or claim that deploying migrates existing user funds.

The browser imports build/contracts/CoinPledge.json through Vite's $contract alias
and uses Viem ABI utilities with the injected EIP-1193 provider. Preserve function
input/output types, event argument names/indexing, Challenge tuple order, and the historical successed spelling.
Changes must be checked against adapter calls, event decoding and tuple conversion.

Contract amounts are wei. Convert user-facing ether with decimal strings or
bigint values, never a JavaScript number. UI deadlines become durations in
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

The browser uses window.ethereum and explicit eth_requestAccounts. Account/network
changes and disconnects must clear stale data and invalidate pending reads. Recheck
the selected account and chain before sending transactions. Runtime bytecode must
match the registered build. Do not add default public RPCs or deployment addresses.
Use chain timestamps for resolution eligibility, and show receipt failures clearly.

## Generated and tracked files

Never hand-edit build/contracts/CoinPledge.json or frontend bundles.
Use forge build, bun scripts/export-contract.js, and bun run build.
The exporter uses deployments/CoinPledge.json and refuses stale bytecode. Register
a deployment with --rpc-url and --address only after deploying the current build;
it verifies runtime bytecode and network ID. Keep local addresses out of public
release commits. Never attach the new ABI to a historical contract.

out/, cache/ and broadcast/ are ignored Foundry outputs. build/contracts/ and dist/
contain tracked outputs; do not delete or blanket-ignore those directories.
Vite regenerates all of dist/; index.html and public/404.html are the maintained
HTML sources. Preserve the static deep-link fallback. Production bundles omit
source maps; the development server supports source debugging. Flattened
Solidity is optional local output, not a tracked build or CI artifact.

## Validation

Contract checks need Foundry and pinned submodules, without frontend dependencies
or a running chain:

- forge install
- forge fmt --check
- forge build
- forge test (unit, fuzz and stateful accounting invariants)
- forge lint contracts/CoinPledge.sol (review intentional timestamp/withdrawal diagnostics)

With Bun available: bun scripts/export-contract.js and
bun scripts/test-export-contract.js. Verify the generated browser artifact matches
source and inspect deployment metadata. Use forge flatten contracts/CoinPledge.sol
on demand if a flattened copy is needed.

Frontend checks use the pinned Bun version:

- bun install --frozen-lockfile
- bun run check (strict TypeScript and Svelte/accessibility diagnostics)
- bun test (tests/unit only, as configured in bunfig.toml)
- bun run build
- bunx --bun playwright install chromium (once; add --with-deps on Linux if needed)

For the actual Forge-to-adapter and Svelte browser integration, start a separate
local Anvil at 127.0.0.1:18545, chain/network 31337, with --hardfork osaka --enable-tx-gas-limit,
then bun run test:integration. This tests mainnet EVM rules on a local chain without
forking mainnet state. The script broadcasts only to a verified local Anvil instance
and uses its unlocked test accounts. It does not alter tracked deployment records.
It provides a verified temporary artifact through COINPLEDGE_ARTIFACT_PATH and launches Playwright/Chromium. Use
bun run test:integration, not the internal test:browser script on its own.
Never use public network transactions or wallet operations as routine validation.

Keep unit tests under tests/unit/ and browser checks in .spec.mts files under
tests/browser/ (native ESM avoids Playwright's CommonJS TS hooks under Bun) so
vendored Solidity dependencies are excluded. Cover meaningful behavior: exact wei,
permissions, wallet lifecycle, transaction receipts and actual browser/contract
flows. Report unexecuted checks and runtime failures. Run git diff --check for all
changes. CI pins Bun and Foundry and checks contracts, generated artifacts,
frontend diagnostics/tests/build, and the local browser integration path.

## Commands and credentials requiring care

- bun run build produces the static site in dist/. There is no website publishing
  script; configure hosting separately when publication is requested. Never add
  source-deletion hooks to a build or publishing workflow.
- bun run compile now runs forge build and exports the browser artifact.
  Truffle is no longer used.
- Select explicit RPC URLs and signers for Forge scripts. --broadcast sends actual
  transactions. Local work uses isolated Anvil accounts, never public signers.
- The deleted truffle.js exposed a mnemonic and RPC credentials in Git history.
  Never reuse that wallet or copy those credentials into new files/logs. Public
  deployments should use a Foundry keystore or hardware wallet and supplied RPC URL.
- LICENSE, package metadata and Solidity headers use MIT.

Keep README.md and these instructions aligned with workflow changes.

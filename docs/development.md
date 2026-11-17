# Local development workflow

## Repository baseline verified on 2026-11-17

| Item | Observed state before finalization |
| --- | --- |
| Working branch | `codex/local-workflow`; setup changes uncommitted |
| Local HEAD | `f42a71f` — Add current BalanceLab educational dashboard and setup documentation |
| Remote | `https://github.com/pengu-png/two-wheel-balancing-edu-kit` |
| Live remote `main` | `f42a71f8ee91f294989940047dc82e47aa0381f0` — complete application import |
| Working tree | Earlier setup documentation/ignore edits carried into this branch, plus CI and documentation updates |
| Upload status | Application successfully pushed; current setup changes remain local |
| Previous push attempt | Earlier HTTP 403 resolved by the user; remote now matches the local import |

Remote HEAD was read with `git ls-remote origin refs/heads/main`; no push, history rewrite, or file deletion was performed in this setup task. Access permissions were not re-tested by attempting another push. The setup documentation and ignore-rule changes are left uncommitted for review.

The imported application has a second `.git` directory. Its HEAD is `33d16aa` (portable local handoff), and it has no remote. The outer repository stores the application as regular source files; there are no submodule entries. **Use Git from the outer repository root.** Git inside the application operates on the imported history and can give misleading status or commit results. Both histories have been preserved. Consolidating them is a separate planned task.

Git author name and email are now configured for this repository. The earlier audit found them absent; the initial import used a one-command override. To change your own repository-local identity in future:

```sh
git config --local user.name "Your GitHub name"
git config --local user.email "Your verified email or GitHub noreply email"
```

See [repository-structure.md](repository-structure.md) for commit-by-commit ownership, the matching 38-file import, and a proposed capstone layout. The three original implementation commits are retained in the inner repository only; the GitHub snapshot does not back up that original history.

## Windows tools: current findings and manual configuration

Both sandboxed and non-sandboxed Codex tool discovery found only bundled Node 24.22.1, with no `npm` or `npm.cmd` on the process PATH. The persisted User and Machine PATH values have no Node/npm/version-manager entries, and common Node installation locations are absent. The temporary npm 11.6.2 tool still exists. These findings suggest that a durable Windows installation is missing, rather than just a sandbox PATH issue. They do not prove what a separately opened PowerShell/profile might provide; no external terminal UI was automated.

In a new PowerShell opened independently of Codex, run:

```powershell
Get-Command node,npm,npm.cmd -ErrorAction SilentlyContinue
where.exe node
where.exe npm
node --version
npm.cmd --version
```

If these work there, compare their paths with Codex and fully restart Codex so it inherits updated PATH values. If they do not, manually install the official Windows Node.js 24 LTS distribution (24.15+ within 24.x), including npm and its PATH integration, or use your existing version manager. Reopen PowerShell and Codex, repeat the checks, and run `npm.cmd ci`, `npm.cmd test`, and `npm.cmd run build` in the application folder. Do not add the Codex WindowsApps runtime path to your permanent PATH as a substitute. No system-wide software, PATH values, execution policies, or Git identity were changed by this task.

## Folder structure and architecture

```text
two-wheel-balancing-edu-kit/
  AGENTS.md                    repository-wide instructions
  README.md                    entry point and commands
  docs/                        development baseline and feature roadmap
  firmware/                    currently empty; Git does not track empty directories
  balancedlab/BalanceLab-local-codex/balancelab/
    .git/                      retained imported history; not part of outer commit
    .openai/hosting.json        original Site identity; not used by local commands
    package.json               scripts and dependency ranges
    package-lock.json          exact dependency installation
    src/App.tsx                modes, navigation, PID draft, recording, confirmations
    src/components/            twin, controls, charts, lessons, challenges, dialogs
    src/lib/                   types, providers, useRobot, metrics, storage
    src/styles.css             base and Engineer styling
    src/student.css            Play/Learn styling
    tests/                     DOM integration suite and jsdom setup
```

The stack is React 19, TypeScript 5.8 with strict checking, Vite 6, Tailwind CSS 4, Lucide React, and Recharts 3. Tests use Node's test runner, tsx, jsdom, and React `act`. The lockfile installed Vite 6.4.6 in this verification. The frontend is a static application without a required backend, API key, CDN, or cloud service.

`App.tsx` owns presentation mode, navigation, PID draft, configured limits, recordings, and live-command confirmation. A single `useRobot` selects a `SimulationProvider` or `WebSocketProvider`. Switching Play/Learn/Engineer only changes presentation; changing the data source or endpoint recreates the provider. Incoming telemetry is buffered up to 1,200 samples; React displays updates at 10 Hz. Recording consumes incoming samples directly rather than the reduced display rate.

The simulator uses an illustrative second-order model, ten 5 ms integration steps per 50 ms telemetry tick: 200 Hz integration and 20 Hz samples. It implements PID-dependent response, bounded motor output/integral state, arm/start/stop/reset, fall and emergency-stop states, and simulated pushes. It is not a physically calibrated model of this robot. The SVG digital twin rotates from fresh measured/simulated angle, clamped visually to ±40 degrees.

Friendly controls map Balance Strength to Kp, Long-term Correction to Ki, and Wobble Control to Kd. Editing changes a shared draft; Apply validates finite values and configured limits. Applied values change only after provider success. Recording locks gains and source changes. Browser-local sessions, CSV export, and measurement summaries share the same pipeline across modes.

The live adapter parses finite required telemetry fields, preserves optional readings as unavailable, tracks freshness (2 seconds), assigns command IDs, and requires matching firmware acknowledgements (4-second timeout). Live Arm, Start, Reset, and Apply require confirmation. The default `wss://robot.local/ws` is an editable example endpoint, not proof of a reachable robot. No protocol changes were made. Firmware must supply trustworthy ordered timestamps and independent safety behavior; the parser does not enforce timestamp monotonicity. Tests cover mocked transport behavior, not real device networking or physical safety.

Measurement explanations come from `education.ts`: measured error/motion/state, rolling wobble, target crossings, and sustained return near target. Improvement claims require compatible complete `push-v1` simulation trials. General Engineer settling time and overshoot remain N/A. See the application README for the full contract and thresholds.

## Daily commands

Open the **outer repository** as the workspace. Use a second terminal rooted in the application for npm commands:

```powershell
Set-Location balancedlab/BalanceLab-local-codex/balancelab
node --version
npm --version
npm ci
npm run dev -- --strictPort
```

Use Node.js 24 LTS, at least 24.15.0 within 24.x, with npm available on PATH. `.nvmrc` selects the 24.x line; `package.json` also accepts Node 26+, but Node 24 is the verified baseline. After installing Node with npm through the official distribution or your usual version manager, reopen the terminal and verify both commands. If PowerShell blocks `npm.ps1`, use `npm.cmd`; do not weaken execution policy. If npm is not found at all, installing only Node or using this app's bundled node executable is insufficient.

For this session, bundled Node 24.22.1 was available but npm was absent. npm 11.6.2 was downloaded from the npm registry to a temporary tools directory, without a global installation or project dependency changes. In this session's ordinary (non-sandbox) PowerShell, it can be invoked with:

```powershell
$npmCli = Join-Path $env:TEMP 'balancelab-npm-11.6.2/package/bin/npm-cli.js'
node $npmCli test
node $npmCli run build
node $npmCli run dev -- --strictPort
```

This temporary fallback may disappear during temp cleanup. Install Node with npm for a durable personal environment. Sandboxed commands have a different TEMP path; this session's checks needed execution outside that isolated temp environment.

The development server started successfully at `http://127.0.0.1:5173/` during the earlier verification pass with loopback binding and strict port selection. That process lifetime is not guaranteed; start it again when needed and stop it with Ctrl+C in its owning terminal/session. `--strictPort` prevents silently selecting a different port, which would create a different browser storage origin.

Before review, run inside the application:

```sh
npm test
npm run build
npm run preview -- --strictPort
```

Preview serves `dist/` on loopback (normally port 4173). It is a different origin from the dev server, so it has separate experiment storage. A production-preview HTTP smoke check passed for the entry point and its built JavaScript asset; interactive production-browser testing remains outstanding. The temporary preview server was stopped after the check. Export important recordings before changing origin or clearing storage. Keep a consistent hostname (`127.0.0.1` versus `localhost` also changes origin).

Use `npm ci` after pulling lockfile changes; routine development can use the installed dependencies. Use deliberate dependency updates and review lockfile diffs; do not run a blanket upgrade or `npm audit fix --force` as a setup step.

## Verification results

Final workflow-branch rerun: all 13 core/provider/education tests and 4 DOM tests passed again under Node 24.22.1 and temporary npm 11.6.2; `npm run build` also passed (Vite 6.4.6, 1,985 modules). No app source, test code, dependency manifest, lockfile, frontend design or robot protocol was changed. The browser rows below describe the earlier inspection, not a new browser test. CI is prepared locally; no hosted result is claimed.

| Check | Result |
| --- | --- |
| Locked install | Passed: 159 packages added; npm audited 166 packages, reported 0 vulnerabilities at install time |
| Core/provider/education tests | Passed: 13/13 |
| DOM integration tests | Passed: 4/4 |
| Production build | Passed: `tsc -b` and Vite build, 1,985 modules transformed |
| Lint | Unavailable: no script/configuration; not treated as a passing lint check |
| Development server | Passed: Vite ready on `127.0.0.1:5173` |
| Production preview HTTP smoke check | Passed: entry point and built JavaScript asset both returned HTTP 200 on loopback port 4173 |
| Browser overview layouts | Inspected Play, Learn, Engineer at 1440×900 desktop and 768×1024 tablet |
| Browser PID workflow | Changed Kp from 32 to 40, explicitly applied, observed success and value continuity in Learn/Engineer, restored 32 |
| Browser digital twin | Simulated push changed lean, pose, recovery feedback and wobble measurements |
| Browser console | No warnings/errors captured during the inspected flows |
| Git hygiene | No tracked dependency/build directories, private-key files or environment files found; targeted secret-pattern scan found no matches (not a comprehensive security audit) |
| Interactive production preview, downloads and physical robot | Not manually verified |

The tests also exercise challenge recording, saving, comparisons, interrupted trials, finite gain validation, freshness, and mocked acknowledgements. jsdom mocks layout, so these assertions do not establish visual correctness.

The inspected overview layouts fit horizontally. At tablet width, the chart and robot stack above the PID/safety area, requiring substantial scrolling; Learn concept cards remain in three narrow columns. No redesign was made. These were browser viewport checks, not testing on a physical touchscreen tablet. Other pages, complete keyboard navigation, screen-reader behavior, mobile widths, download contents, storage-failure recovery in a real browser, and real ESP32 networking/safety still require manual verification.

Initial sandbox attempts could not see the temporary npm directory or open loopback HTTP sockets; the npm and HTTP checks passed when run outside those restrictions. Documentation links and the changed-file whitespace check passed. Ignore-rule probes confirmed generated/secret paths are excluded and sanitized `.env.example` remains eligible for tracking. No application build/test failures remain. A pre-existing trailing space in `src/lib/core.test.ts` was observed in the earlier import; no source formatting cleanup was performed.

## Git hygiene and review

Root and application ignore rules now exclude dependencies, dist output, coverage, TypeScript build state, logs, `.tools`, local `.env*`, `.npmrc`, common private key/certificate containers, and common credential JSON filenames. Sanitized `.env.example` files can be committed. Ignore rules do not untrack existing files or guarantee secret detection; inspect staged diffs and use secret scanning before publishing. The retained hosting JSON contains a Site project identifier, not a credential.

Keep `main` as the reviewed baseline and use one short-lived `codex/<task>` branch per change. From the outer root, check local/remote state before branching. The complete import now matches GitHub; inspect any future divergence before pulling or merging.

```sh
git status --short
git branch -vv
git ls-remote origin refs/heads/main
git switch -c codex/describe-task
```

Edit, run checks, inspect the outer diff, stage only intended files, and commit locally with the configured identity. Push and create a pull request only when explicitly requested. Future branches should start from an updated reviewed `main`; inspect any divergence before merging. No force-push is needed for this workflow.

The prepared `.github/workflows/frontend-ci.yml` runs `npm ci`, `npm test`, and `npm run build` from the application directory on Ubuntu with Node 24.22.1. It triggers for pull requests into `main` and manual dispatch, caches npm against the lockfile, uses read-only contents permissions and disables persisted checkout credentials. There are no deployment steps, secrets, or path filters. The workflow follows [GitHub's Node.js CI guidance](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs). Its first hosted execution remains pending until review, commit, push and triggering. Required-check enforcement is a separate GitHub repository setting after the first successful run. No linter was added. Consider changed-line whitespace checks, secret scanning and broader browser tests separately.

## Next three tasks

1. **Complete local tooling and history backup:** configure your local commit identity, install durable Node 24 + npm, and agree on preservation/consolidation of the inner history. GitHub already contains the complete application files.
2. **Review and activate CI:** review this uncommitted branch, commit/push only on request, confirm a hosted run and configure the required check. Introduce linting separately.
3. **Prepare ESP32 integration validation:** inventory the actual board, sensor, motor driver, pinout and firmware state; define a supervised checklist against the existing telemetry/acknowledgement contract. Confirm watchdog and independent stop behavior before motor-enabled tests. Hardware feature work follows that review.

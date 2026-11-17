# Local BalanceLab setup

Open the outer `two-wheel-balancing-edu-kit` folder as your workspace. The application lives at `balancedlab/BalanceLab-local-codex/balancelab/`. This folder retains a separate imported `.git` history with no remote; run all Git commands from the outer root, where the GitHub remote is configured. Do not delete either history.

## Prerequisites

Use Node.js 24 LTS, at least 24.15.0 in the 24.x line, with npm. `.nvmrc` selects Node 24. Verify `node --version` and `npm --version`. If PowerShell blocks the npm script shim, use `npm.cmd`; if npm is absent, install Node with npm and reopen your terminal. No API keys, backend, Site account or environment variables are needed.

The 2026-11-17 Codex session had bundled Node 24.22.1 but no npm on PATH. Checks used temporary npm 11.6.2 downloaded from the npm registry. See the outer [development report](../../../docs/development.md) for that fallback and its limits; use a normal Node/npm installation for durable development.

## Start and validate

From the outer root:

```powershell
Set-Location balancedlab/BalanceLab-local-codex/balancelab
npm ci
npm run dev -- --strictPort
```

Open `http://127.0.0.1:5173/`. The app starts in Play with simulated telemetry; Learn and Engineer share the same running robot state. Ctrl+C stops the server. Keep the dev server on loopback. Network access is needed to install dependencies; runtime assets are bundled locally.

In another terminal inside this application:

```sh
npm test
npm run build
npm run preview -- --strictPort
```

The existing 17 tests and production build passed locally on 2026-11-17. No lint script exists. Preview serves `dist/` on loopback, normally port 4173; its entry point and built JavaScript returned HTTP 200 in a smoke check. Interactive production-browser testing remains outstanding. See the development report for desktop/tablet inspection and outstanding manual checks.

## Recordings and hardware

Recordings live in localStorage per browser origin. Port changes, `localhost` versus `127.0.0.1`, and preview versus development have separate storage. Export important data before changing origin or clearing storage. The source migration does not copy recordings from the original hosted Site.

The existing ESP32 adapter is `src/lib/providers.ts`; the contract is in `src/lib/types.ts` and README.md. Configure the real endpoint in Settings only when ready for supervised hardware validation. The default `wss://robot.local/ws` is an example, not a working connection guarantee. HTTP local pages can use `ws://`; HTTPS pages require `wss://`. Simulation pushes, live confirmation, acknowledgements, freshness and gain limits must remain intact. Independent physical stops and firmware watchdogs are required.

`.openai/hosting.json` is non-secret original Site identity metadata. Running local commands does not publish or modify that Site. Do not push or deploy without an explicit request.

## Continue development

Read the outer AGENTS.md, this folder's AGENTS.md, README.md and HANDOFF.md. Use short-lived `codex/<task>` branches from a reviewed baseline. See [the roadmap](../../../docs/roadmap.md) for completed features, current placeholders and next priorities. Review the outer Git diff and run tests/build before requesting review.

# BalanceLab repository instructions

## Context and scope

This repository is the two-wheel balancing education capstone. Preserve the migrated BalanceLab application; do not replace it. Read `docs/development.md`, the application README, `HANDOFF.md`, and the more specific application `AGENTS.md` before changing code.

- Repository root: this directory; remote: `https://github.com/pengu-png/two-wheel-balancing-edu-kit`.
- Application: `balancedlab/BalanceLab-local-codex/balancelab/`.
- `firmware/` currently has no files. The frontend includes an ESP32 WebSocket adapter, but hardware operation is unverified.
- `.openai/hosting.json` is retained Site identity metadata. Local development does not publish the original Site.

## Git workflow

The migrated application still contains its own `.git` directory with a separate history and no remote. The outer repository tracks its source as normal files, not a submodule. Do not delete or rewrite either history. Run Git from the outer root, or explicitly use `git -C <outer-root> ...`, even when editing application files. A Git command run inside the application selects the inner repository.

Use short-lived `codex/<task>` branches from the reviewed baseline. Inspect status and diff before edits and before committing. Do not force-push, reset user work, delete files, deploy, or push unless explicitly requested. Preserve the current folder structure until a separately reviewed migration is authorized. Report remote verification separately from local commits; remote-tracking refs can be stale.

## Runtime and checks

Use Node.js 24 LTS, at least 24.15.0 in the 24.x line, with npm and the committed lockfile. Run application commands inside the application directory:

```sh
npm ci
npm run dev
npm test
npm run build
```

Development and preview servers must remain loopback-only. `npm run preview` serves the built output. There is no lint script or lint configuration currently. Build runs strict TypeScript checking; it is not a replacement for linting. Do not claim a check passed unless it ran successfully. Report environment blockers and distinguish mocked tests from browser and physical-hardware checks.

The prepared `.github/workflows/frontend-ci.yml` runs the existing install/test/build commands for PRs into `main` using Node 24.22.1. Keep its application working directory and lockfile cache path aligned if a separately approved folder migration occurs. See `docs/repository-structure.md` before changing Git ownership; original inner commits have not been imported into the outer history.

## Coding conventions

- Follow existing React function components, TypeScript strict types, named component exports, and existing CSS classes. Use descriptive names and avoid unrelated reformatting of the compact migrated files.
- Keep presentation in `src/components`, provider/state/measurement code in `src/lib`, and orchestration in `src/App.tsx`. Avoid refactoring these boundaries during unrelated work.
- Reuse existing dependencies, local SVG assets, charts, dialogs, and providers. Justify new dependencies; preserve static hosting with relative assets and no runtime cloud requirement.
- Preserve browser-local session compatibility. Add optional fields when extending saved data; never silently erase recordings. Update README/roadmap when behavior changes.
- For functional changes, run the full existing tests and production build; add focused regression tests for new behavior or fixes. UI changes also require desktop/tablet browser inspection. Check keyboard operation, reduced motion, focus containment, and persistent access to emergency stop.

## Robot and measurement safety

- Play, Learn, and Engineer share one `useRobot` lifecycle, applied/draft PID state, telemetry, and recording pipeline. Mode switches must not reconnect, reset gains, or interrupt recordings.
- Friendly labels map to Kp/Ki/Kd. Sliders edit draft values only; Apply validates finite configurable limits and awaits acknowledgement for live commands.
- Preserve the existing ESP32 protocol, command IDs, acknowledgements, timeout, freshness checks, live confirmation, and source/recording locks. Protocol changes need a separate explicit request.
- Pushes and standardized challenges remain Simulation-only. Never fabricate live telemetry, position sensing, autonomous travel, or evidence of improved performance.
- Derive feedback from the documented measurement rules in `src/lib/education.ts`; keep unsupported settling time/overshoot unavailable.
- Browser emergency stop cannot replace an independent physical stop, firmware watchdog, or supervised hardware testing. Do not send live hardware commands during ordinary frontend checks.
- Keep secrets, local environment files, dependencies, and generated output out of Git. The `.env` ignore exceptions are for sanitized example files only.

# BalanceLab — local Codex project

Read HANDOFF.md and README.md before changing code.

Also follow the outer repository's `AGENTS.md` and `docs/development.md` (three directories above this folder). This imported folder retains a nested `.git` directory. Use Git explicitly from the outer repository root so changes belong to the GitHub capstone repository; do not delete or rewrite the imported history.

## Work locally

This folder is a local continuation of the existing BalanceLab project. Do not create a replacement app. Local development is the default. Do not publish to ChatGPT Sites or push to an external repository unless the user asks. The retained .openai/hosting.json records the original Site identity; it is not a requirement for running locally.

## Commands and stack

- Use Node.js 24 LTS (24.15.0 or newer in the 24.x line), npm and the committed lockfile.
- Install with `npm ci`.
- Start with `npm run dev` (loopback only).
- Validate functional changes with `npm test` and `npm run build`.
- Preview built assets with `npm run preview`.
- Stack: React, TypeScript, Vite, Tailwind CSS, Lucide React and Recharts. Keep runtime assets locally bundled and the output suitable for static hosting.

## Preserve the working design

- Play is the default presentation; Learn adds concepts and guidance; Engineer retains the dark advanced dashboard.
- All learning modes share the same useRobot hook, providers, applied/draft PID state and recording system. Switching learning mode must not reconnect or reset the robot.
- Reuse the SVG digital twin, telemetry charts and recording/export functions.
- Friendly gain labels map to actual Kp/Ki/Kd values. Keep gain limits configurable and validate Apply commands. Do not send changes continuously from sliders.
- Derive educational feedback and comparison claims from measured data using the documented methods in src/lib/education.ts. Do not seed fake results or live telemetry.
- Push challenges are Simulation-only. Preserve live command confirmation, freshness checks, firmware acknowledgements, visible emergency stop and independent physical safety assumptions.
- Preserve compatibility with existing browser-local sessions. New session fields should be optional when possible.

## Current verification limit

On 2026-11-17, all 17 existing tests and the production build passed locally. Play, Learn and Engineer overview layouts were inspected at 1440×900 and 768×1024; simulated pushes and PID application were also exercised in the browser. Live tests use mocked WebSockets; physical hardware remains unverified. See the outer `docs/development.md` for the dated report and environment caveats. Re-run checks after functional changes; this baseline is not proof of future correctness.

## Conventions and testing

Follow existing function components, strict TypeScript types, named exports, and scoped CSS. Avoid unrelated reformatting or structural changes. Keep shared provider and measurement logic in `src/lib`, reusable UI in `src/components`, and application orchestration in `App.tsx`. Reuse installed dependencies before adding packages. Run `npm test` and `npm run build` for functional changes, with focused regression coverage and desktop/tablet visual inspection for UI changes. No lint script currently exists. Do not change the ESP32 protocol without a separate explicit request.

# BalanceLab — local Codex project

Read HANDOFF.md and README.md before changing code.

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

Core and DOM interaction tests are provided. Browser visual QA was unavailable in the original cloud session. Verify responsive layouts visually in your local browser when changing UI.

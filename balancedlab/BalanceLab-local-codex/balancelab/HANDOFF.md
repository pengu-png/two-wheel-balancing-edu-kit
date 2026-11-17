# BalanceLab development handoff

Current repository note (2026-11-17): this file describes the imported project and migration history. The authoritative current workflow and verification record are in the outer repository's `docs/development.md` (three directories above this folder). The outer repository now tracks the source and has the GitHub remote; this folder retains a separate imported `.git` history with no remote. Local tests/build and desktop/tablet overview inspection have since passed. Use Git from the outer root; preserve both histories.

## Current product

The existing application is a static React + Vite + TypeScript frontend for an educational two-wheel self-balancing robot. No backend or cloud service is needed to run it locally.

- **Play:** default light-themed robot playground, friendly real-gain controls, bounded simulated pushes, telemetry-derived feedback, optional response graph and optional walkthrough.
- **Learn:** shared playground plus engineering terms, PID learning cards, graph hints and guided investigations.
- **Engineer:** original dark dashboard, six telemetry cards, real-time charts, PID Studio, five advanced experiment workflows, results table and exports.
- **Challenges:** three Simulation-only 12-second reset/arm/start/push tests, prediction capture, recording, save/notes and Before vs After explanations. Finish-line travel is clearly a future feature.
- **Live architecture:** typed WebSocket telemetry, command IDs, acknowledgement matching, stale/disconnected handling and explicit live command confirmation. It still needs actual ESP32 firmware and hardware validation.

## Files to know

- `src/App.tsx`: application orchestration, shared PID state, navigation, recording, safety actions and confirmation.
- `src/lib/useRobot.ts`: one provider lifecycle and display buffer shared by every learning mode.
- `src/lib/providers.ts`: educational simulator, telemetry parser and ESP32 WebSocket adapter.
- `src/lib/types.ts`: PID, telemetry, state, connection and saved-session contracts.
- `src/lib/education.ts`: documented status/wobble thresholds, challenge metrics, eligibility checks and comparison language.
- `src/lib/chartData.ts`: align comparison traces using actual timestamps.
- `src/lib/storage.ts`: browser-local sessions, CSV exports and basic metrics.
- `src/components/RobotVisualizer.tsx`: original shared animated SVG robot, with a friendly presentation option.
- `src/components/RealtimeChart.tsx`: shared scrolling/paused/trace-selectable chart and educational markers.
- `src/components/StudentDashboard.tsx`, `StudentControls.tsx`, `GraphExplorer.tsx`, `LearningCards.tsx`, `MiniChallenges.tsx`, `StudentResults.tsx`, `Walkthrough.tsx`: student presentation.
- `src/components/AccessibleDialog.tsx`: keyboard focus containment, Escape and focus restoration.
- `src/styles.css`: original Engineer theme; `src/student.css`: scoped Play/Learn theme.
- `src/lib/*.test.ts`, `tests/app.test.tsx`, `tests/setup.mjs`: 17 core and DOM integration tests. The test setup mocks layout and ignores CSS imports; it does not test visual layout.

## Local migration details

Published source baseline: `91fd4c20ffcc5814468b3c80ce44ef3f6d8287c3` (Site version 2).

The local migration adds setup/handoff/agent documentation and `.nvmrc`, declares a compatible Node version, changes the development host to loopback and adds a local production-preview command. Application behavior is unchanged. Source, tests and Git history are included; dependency directories, build output, credentials and cloud Git remotes are excluded.

The hosted copy is still at https://balancelab-control-trainer.animatedbug4.chatgpt.site. Local work does not update that Site automatically. Browser-origin experiment data does not travel with source code.

## Useful next steps

Follow the user's next request. Potential work includes local browser checks at desktop/mobile sizes, actual ESP32 protocol integration, and teacher-guided physical testing. Preserve the existing modes and shared control logic. No such additional feature work is required just to run this export.

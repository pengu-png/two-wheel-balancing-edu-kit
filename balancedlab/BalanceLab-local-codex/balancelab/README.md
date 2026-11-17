# BalanceLab — Control System Trainer

A React + Vite + TypeScript dashboard for a two-wheel balancing robot. Tailwind CSS, Lucide icons, Recharts, and SVG assets are bundled locally. No runtime CDN, backend, or cloud API is required. Start in Simulation mode; all generated measurements are labeled as simulated.

## Run locally

Use Node.js 24.15+ in the 24.x LTS release line and npm. See LOCAL_SETUP.md for local Codex setup.

```sh
# From the outer two-wheel-balancing-edu-kit repository root:
cd balancedlab/BalanceLab-local-codex/balancelab
npm ci
npm run dev
```

Open the local URL Vite prints. `npm run build` type-checks and builds static assets into `dist/`. Serve that directory using any static server or the ESP32 filesystem/server. Ensure JavaScript and CSS MIME types are correct. The production frontend is about 232 KB gzipped; confirm space and transfer performance on your firmware. Relative asset URLs support static hosting.

`npm test` runs core calculation/provider tests and DOM integration tests. It covers mode access, shared PID state and provider continuity, digital-twin movement, recording and comparison, live confirmation/acknowledgement, emergency interruption, freshness, and measurement validity. DOM tests do not substitute for browser visual QA.

## Explore

- **Overview:** six telemetry cards, an animated SVG robot, scrolling chart, explicitly applied PID values and separate arm/control/stop actions. Chart pause affects visualization only; recording continues. Trace toggles, reset and 10/30/60-second windows are interactive.
- **PID Studio:** illustrative P-only, PD and full PID examples, editable gains and explanations. Applying is required; dragging never sends commands. These examples are not real robot calibration values.
- **Experiment Lab:** five guided workflows. Record, stop, name, annotate, and save a session. PID changes and source switching are locked while recording so a session retains a known configuration. Recording is limited to 10 minutes at the simulator's 20 Hz rate; a live recording stops if telemetry becomes stale or disconnected.
- **Results & Comparison:** select up to four saved sessions, align angle-error curves to each recording's first sample, compare max absolute error and RMSE, and export raw CSV or a text summary. Sessions use browser localStorage; export important data before clearing the browser or changing hosts. Storage failures preserve the pending session for CSV export.
- **Settings:** switch data source, configure the WebSocket endpoint and slider limits. Settings and gains reset when the page reloads; recorded sessions persist. No example sessions or fabricated analysis results are seeded.

The Engineer table’s general settling-time and overshoot fields remain N/A; there is no reference-step protocol. Student challenges separately define a return-near-target measure described below. Compare RMSE only across comparable test conditions and durations. The simulator is an illustrative second-order model, not a validated digital twin of your mechanics.

## ESP32 WebSocket integration

The shared schema is in `src/lib/types.ts`. Add or map firmware telemetry in `parseTelemetry` inside `src/lib/providers.ts`; implement protocol changes in `WebSocketProvider`. `src/lib/useRobot.ts` selects the provider and separates the 10 Hz React display from incoming telemetry. History retains up to 1,200 samples. The simulator sends at 20 Hz and integrates at 200 Hz.

Required incoming fields:

```json
{"type":"telemetry","timestamp_ms":123456,"angle_deg":2.4,"target_deg":0}
```

Optional fields: `angular_velocity_dps`, `motor_left_pct`, `motor_right_pct`, `battery_voltage`, `control_hz`, and `state`. Recognized states are `BALANCING`, `ARMED`, `DISARMED`, `STOPPED`, `FALLEN`, `ESTOP`. Missing optional readings display as unavailable. The firmware should send monotonically increasing timestamps during a connection and publish its actual controller state. Two seconds without valid telemetry is stale. Opening a socket alone does not count as fresh telemetry. Live applied PID starts unknown until an explicit parameter command is acknowledged.

Outgoing command:

```json
{"type":"command","id":1,"action":"pid","parameters":{"kp":32,"ki":0.8,"kd":4.2}}
```

Actions: `pid`, `arm`, `disarm`, `start`, `stop`, `estop`, `reset`. `disturb` is simulation-only in the UI. A successful command must return:

```json
{"type":"ack","id":1,"ok":true}
```

Failures return `{"type":"ack","id":1,"ok":false,"error":"Reason"}`. The frontend times out after four seconds and does not mark new gains applied without success. Fresh telemetry drives the displayed robot state. Commands are disabled without fresh data; emergency stop remains callable and reports transport/acknowledgement failures.

An HTTPS-hosted page requires a secure WSS endpoint. For a typical ESP32 `ws://192.168.x.x/ws`, run the frontend locally over HTTP on the same network. Device reachability, TLS, browser local-network permissions and firmware security are deployment responsibilities.

Independent physical safety mechanisms and firmware watchdogs are required for real hardware. A browser emergency-stop control cannot guarantee stopping across a lost network connection.

## Source organization

- `src/components/`: robot visualizer, reusable response chart and PID control panel.
- `src/lib/providers.ts`: simulation and WebSocket transport.
- `src/lib/useRobot.ts`: provider lifecycle and telemetry display buffer.
- `src/lib/storage.ts`: browser session storage, metrics and exports.
- `src/App.tsx`: navigation, page layouts, recording and application orchestration.
- `src/styles.css`: responsive design, dark palette and reduced-motion support.

## Play, Learn and Engineer

**Play** is the default landing experience. Its light theme, large shared digital twin, friendly controls and optional graph let students explore first. **Learn** introduces actual PID terms, concept sketches, contextual graph explanations and predict-and-observe challenges. **Engineer** retains the existing dark dashboard, six telemetry cards, PID Studio, five advanced experiment workflows, complete saved-session table and exports.

The learning-mode selector changes presentation only. It does not recreate the provider, reset the simulation, reconnect hardware, reset applied/draft gains or interrupt recording. The separate Simulation/Live source selector remains under Settings. Optional onboarding can be skipped or replayed. Stored sessions retain their original format; new educational metadata is optional and compatible with existing recordings.

Friendly controls use the real configurable gain values: Balance Strength = Kp, Long-term Correction = Ki, Wobble Control = Kd. All Apply paths validate the same configured limits. Changing a limit does not send a command or silently alter a gain; a value outside the new range must be adjusted before applying. Defaults are educational examples, not safe hardware calibration limits.

### Documented feedback

`src/lib/education.ts` is the shared measurement/summary module:

- Balancing: firmware/simulator state BALANCING, absolute angle error ≤2°, and measured absolute angular velocity ≤3°/s.
- Recovering: the robot is balancing and its angle is moving toward the current target (error × angular velocity <0).
- Wobble: population standard deviation of sampled angle error in the latest 3 seconds. Requires at least 10 samples and 1 second of coverage. Low <0.5°, Moderate <2°, High ≥2°. Low variation alone does not prove good balance; a persistent lean can have low variation.
- Missing velocity does not imply zero velocity. Stale/disconnected data never produces a stable-state message. Historical graphs are explicitly identified when current telemetry is unavailable.

The graph’s ±2° band is only a near-target visual aid, displayed for a constant target. A band crossing alone is not a settling claim. The biggest-lean marker uses the actual visible data window. Concept-card sketches are labeled illustrative, not live data. Comparison overlays use actual relative sample timestamps instead of assuming uniform sample spacing.

### Reproducible short challenges

The three current challenges all use the same **push-v1** Simulation protocol: preserve applied gains, reset controller/integral state, arm, start (initial simulated lean 6°), and add the existing bounded +8° / +3°/s simulated nudge. Capture 12 seconds from the first received sample (normally 241 samples at 20 Hz). This uses the existing provider and recording pipeline. It sends no physical push command. Applied gains stay locked during a test. Safety stop/disarm remain available and end the test as incomplete. Students can save their prediction and add a reflection in the existing save dialog.

A student comparison makes improvement claims only when both sessions are completed push-v1 Simulation tests, cover 12–12.25 seconds, have initial errors within 0.5° and the same constant target. Samples must be strictly ordered with no gap above 250 ms. Other sessions still show their traces and measurements, but do not receive a better-or-worse explanation.

- **Return near target:** first sample of the final uninterrupted interval lasting at least 2 seconds within ±2° error and ±3°/s, while BALANCING. Missing motion or no sustained return produces N/A. This is a defined learning measure, separate from the Engineer table’s unsupported general settling-time/overshoot fields.
- **Target crossings:** count side-to-side error sign changes outside a ±0.5° deadband. This is an oscillation clue under the same test conditions, not an arbitrary score.
- **Biggest lean:** maximum absolute angle error in the recording.

“Reach the Finish Line” is a future-feature explanation only. No position measurements, wheel encoder integration or autonomous travel are fabricated. Extending the typed telemetry contract/provider later can add these capabilities without creating another control system.

### Live commands

Arm, Start, Reset and Apply require an explicit live-command confirmation. Stop, Disarm and Emergency Stop do not acquire a confirmation delay. Each live command still requires firmware acknowledgement. The transport itself rejects non-emergency commands when telemetry is older than two seconds or absent, even before UI refresh. Safety stop is available within live confirmation, onboarding, save and expanded-visualizer dialogs. Emergency stop cancels any pending command confirmation. Source changes are blocked during recording/pending commands; presentation-mode changes remain available.

### Learning components

New components include `LearningModeSelector`, `StudentDashboard`, `StudentControls`, `LearningCards`, `GraphExplorer`, `MiniChallenges`, `StudentResults`, `Walkthrough` and `AccessibleDialog`. The original `RobotVisualizer`, `RealtimeChart`, `PIDControlPanel`, `useRobot`, simulator and WebSocket envelope remain shared. `student.css` scopes the light design to Play/Learn; Engineer styles remain in `styles.css`. Dialogs support Escape, keyboard focus containment and focus restoration. Reduced-motion preferences apply to transitions and scrolling.

## Verification

Local verification on 2026-11-17 passed: locked dependency installation, 13 core/provider/education tests, 4 DOM integration tests, and the production type-check/build. Play, Learn and Engineer overview layouts were inspected in a browser at 1440×900 and 768×1024. Explicit PID application, gain continuity across modes, and digital-twin response to a simulated push were exercised. No browser console warnings/errors were captured in those flows. No lint script currently exists.

Real ESP32 networking, firmware and physical safety remain unverified. Other pages, full keyboard/accessibility behavior, real tablet touch input, download contents and production preview still need manual checks. See the outer repository's [development report](../../../docs/development.md) and [roadmap](../../../docs/roadmap.md) for the full baseline and planned work. Use Git from that outer root: this imported application retains a separate nested Git history.

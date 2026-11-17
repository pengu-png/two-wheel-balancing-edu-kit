# BalanceLab roadmap

Status reviewed on 2026-11-17. This tracks observed implementation rather than promising delivery dates. See [development.md](development.md) for verification evidence and workflow.

## Completed in the frontend

- [x] Local static React/TypeScript application with Vite, locked npm dependencies and loopback development/preview scripts.
- [x] Play default experience, Learn concepts/guidance, and dark Engineer dashboard sharing one robot provider and PID/recording state.
- [x] SVG robot attitude view driven by telemetry, charts, optional graph explanations and configurable viewing windows.
- [x] Illustrative PID simulation with bounded disturbance, controller states, fall handling and emergency reset/rearm behavior.
- [x] Draft/applied gain separation, friendly Kp/Ki/Kd labels, configurable limits, explicit validated Apply, and PID examples.
- [x] Five Engineer experiment guides; three standardized 12-second simulation challenges with predictions/reflections.
- [x] Recording, browser-local session storage, comparison traces, measured metrics, CSV/text export and interrupted-trial handling.
- [x] Measurement-based educational feedback and eligibility checks for before/after improvement claims.
- [x] Live WebSocket frontend adapter with typed telemetry, command IDs, acknowledgement handling, timeout/freshness states and confirmation flows (mock-tested; hardware not verified).
- [x] Onboarding, expandable visualizer, focus-handling dialogs and reduced-motion CSS (full accessibility audit remains outstanding).
- [x] Local baseline: 17 tests pass, production build passes, all three overview modes inspected at desktop/tablet viewports.
- [x] Repository/application instructions, root setup guidance, roadmap and generated-file/secret ignore rules.

## Planned, in priority order

- [x] Verify successful GitHub upload: `main` matches `f42a71f` and contains all 38 imported files as regular blobs.
- [ ] Configure durable Node 24 + npm and local Git author identity.
- [ ] Consolidate nested Git ownership without losing imported history; retain current folders until a reviewed migration is agreed.
- [x] Prepare pull-request CI for locked installation, tests and production build using the existing scripts.
- [ ] Review the workflow branch, commit/push on request, verify a hosted run and configure required-check enforcement.
- [ ] Add a lightweight lint configuration and script in a separate change.
- [ ] Expand browser checks to PID Studio, challenges, results, settings, CSV/text downloads, keyboard flows, storage failure and smaller/mobile viewports.
- [ ] Review tablet usability: PID/safety controls below the twin/chart; narrow Learn cards. Preserve the current design until changes are requested.
- [ ] Inventory actual hardware and define supervised firmware integration tests against the existing protocol, including stale/disconnected data, rejected/late acknowledgements, reset and independent emergency-stop/watchdog behavior.
- [ ] Implement/bring in ESP32 firmware after hardware requirements and safety behavior are agreed. The current `firmware/` directory is empty.

## Future features and current placeholders

- [ ] **Reach the Finish Line:** explanatory future-feature UI only. Requires real wheel encoder/position measurements and a cascaded position/balance controller. No current position tracking or autonomous travel.
- [ ] **General settling time and overshoot:** Engineer fields deliberately display N/A. Requires an agreed reference-step protocol and valid measurements; the existing challenge-specific sustained return-near-target measure is separate.
- [ ] **Calibrated robot model:** current simulator is educational, not a mechanically validated digital twin. Validate against measured hardware before claiming physical fidelity.
- [ ] **Broader browser regression automation:** evaluate lightweight smoke coverage after the basic CI workflow is established; justify any added dependencies.

Runtime gains/settings currently reset on reload; experiment recordings persist only per browser origin. Cross-device sync, hosted services and automatic deployment are not implemented or committed roadmap requirements. Extend scope only when requested.

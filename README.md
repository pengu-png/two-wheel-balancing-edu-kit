# Two-wheel Balancing Education Kit

Capstone project featuring BalanceLab, an educational control-system dashboard for a two-wheel balancing robot.

The current frontend is in [`balancedlab/BalanceLab-local-codex/balancelab`](balancedlab/BalanceLab-local-codex/balancelab). It includes Play, Learn and Engineer modes, a simulator, PID controls, experiment recording, and an ESP32 WebSocket interface.

## Run locally

Use Node.js 24.15 or newer in the 24.x LTS line and npm:

```sh
cd balancedlab/BalanceLab-local-codex/balancelab
npm ci
npm run dev
```

Run `npm test` and `npm run build` from the same directory to validate the frontend.

See the [BalanceLab README](balancedlab/BalanceLab-local-codex/balancelab/README.md) for features and the hardware protocol, and [local setup guide](balancedlab/BalanceLab-local-codex/balancelab/LOCAL_SETUP.md) for development instructions. Actual ESP32 firmware and hardware validation remain future work.

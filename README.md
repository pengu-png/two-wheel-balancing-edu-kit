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

## Development foundation

Read [the local workflow and verification report](docs/development.md), [feature roadmap](docs/roadmap.md), and [repository instructions](AGENTS.md) before continuing development.

Open this outer repository as your workspace and run Git here. The imported application retains a nested Git history; Git commands inside its folder target that separate repository. Both histories are preserved.

Verified on 2026-11-17: dependency installation, all 17 tests, production build, and Play/Learn/Engineer overview layouts at desktop and tablet sizes passed. No lint script exists yet. Physical ESP32 behavior remains unverified. Node was available in this Codex session but npm required a temporary tool installation; install Node 24 with npm for a durable environment.

The complete application import `f42a71f` is verified on GitHub `main`. Setup changes are maintained on `codex/local-workflow` for pull-request review. Read [repository ownership and the proposed layout](docs/repository-structure.md) before consolidating Git history. The prepared [Frontend CI workflow](.github/workflows/frontend-ci.yml) runs existing tests and the production build for pull requests into `main`; its first GitHub-hosted run is pending.

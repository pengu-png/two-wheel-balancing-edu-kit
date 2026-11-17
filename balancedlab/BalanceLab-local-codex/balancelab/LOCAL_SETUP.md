# Open BalanceLab in local Codex

This is the complete BalanceLab source from published version 2, based on commit `91fd4c20ffcc5814468b3c80ce44ef3f6d8287c3`, with a small local migration commit for setup instructions and scripts. It includes Git history, the React application, lockfile and all tests. The hosted application has not been changed by this export.

## 1. Extract and open

Extract `BalanceLab-local-codex.zip` into a folder you own, such as your normal Projects folder. Open the extracted **balancelab** folder as a local project in the Codex desktop app. If using the Codex CLI, open a terminal in that folder and run `codex`.

The directory you open must contain `package.json`, `src/`, `tests/`, and `AGENTS.md`. No ChatGPT Sites account, API keys, backend or environment variables are needed for local development.

## 2. Install Node.js and dependencies

Use a current **Node.js 24 LTS** release, at least 24.15.0. The existing locked jsdom dependency needs this newer version; older Node 22 releases listed in the original cloud README are not sufficient. A `.nvmrc` is provided if you use nvm (`nvm install` then `nvm use` inside the folder). Windows users can install Node.js 24 LTS normally and use PowerShell or a terminal in Codex.

Run these commands inside the extracted `balancelab` folder:

```sh
node --version
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://127.0.0.1:5173`. The app starts in Play Mode with simulated telemetry. Learn and Engineer remain accessible through the mode selector. The dev and preview scripts bind to the local computer by default.

`node_modules` and generated build files are intentionally excluded from the download. `npm ci` installs the correct dependencies for your operating system from the included lockfile. Network access is required for this first installation; runtime assets are bundled locally.

## 3. Verify and build

```sh
npm test
npm run build
npm run preview
```

The production output is `dist/`. The test command includes both core calculations/provider tests and DOM integration tests; there are 17 tests. These checks do not replace browser visual or real-hardware verification.

## 4. Continue with Codex

Suggested first message:

> Read AGENTS.md, HANDOFF.md and README.md. This is the existing BalanceLab project. Run the tests and build, then help me continue development locally while preserving Play, Learn and Engineer modes and the shared robot state. Keep work local unless I explicitly request deployment.

The package contains its Git history, including the original two implementation commits. The cloud Git remote has been removed from this local copy. You may add your own GitHub or other remote later. `.openai/hosting.json` is retained as non-secret source metadata for the existing Site; local `dev`, `test`, `build` and `preview` commands do not use it or publish anything.

## 5. Experiment recordings and hardware

Experiment recordings are stored in each browser origin's localStorage. The project archive contains source code, not recordings from your browser. Existing online recordings stay at the hosted URL; use the app's CSV export to retain their telemetry. The local app starts with its own browser storage.

The ESP32 WebSocket adapter is `src/lib/providers.ts`, with the schema in `src/lib/types.ts`. Set your device URL in Settings. An HTTP local frontend can use `ws://` on the same network; an HTTPS frontend needs `wss://`. There is no connected physical robot in this export. Simulation-only push actions, explicit live confirmations, firmware acknowledgements, configured gain limits and independent physical safety requirements remain in place.

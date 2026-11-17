# Repository ownership and proposed structure

Inspected on 2026-11-17. No history, source or Git metadata was removed or relocated.

## Two histories, one working application

| Repository | Role | Commits | HEAD | Remote |
| --- | --- | --- | --- | --- |
| Outer capstone root | GitHub project; tracks full imported source | 2 | `f42a71f` | `pengu-png/two-wheel-balancing-edu-kit` |
| `balancedlab/BalanceLab-local-codex/balancelab` | Original BalanceLab history | 3 | `33d16aa` | None |

The inner history is `e34c9cf` (initial trainer), `91fd4c2` (Play/Learn), and `33d16aa` (local handoff). The outer history is `a136c79` (capstone initial commit) and `f42a71f` (import). The outer import contains all 38 tracked inner files: mode, blob hash and relative path match the inner HEAD exactly. Both repositories refer to the same files on disk; there are not two separate working copies of the app.

GitHub `main` resolves to `f42a71f8ee91f294989940047dc82e47aa0381f0`. Its identity matches the inspected outer tree, which contains regular blobs and no mode-160000 gitlinks. Therefore GitHub contains complete application source rather than a submodule pointer. The three original implementation commits are retained locally in the inner repository, but are **not ancestors of the published outer import** and are not backed up by that push.

Run Git at the outer root. Inside the application, Git selects the inner history and does not show root docs or CI changes. New clones from GitHub do not contain the nested `.git` metadata; this ambiguity affects the current migrated working copy.

## Recommended eventual capstone layout

```text
two-wheel-balancing-edu-kit/
  .git/                 one active repository
  .github/workflows/    project checks
  AGENTS.md
  README.md
  docs/                 workflow, architecture, hardware and experiments
  frontend/             existing BalanceLab package, src and tests
  firmware/             future ESP32 project
```

This is a recommendation, not the current layout. This task keeps the existing application path unchanged and prepares CI against that path. A later move must update documentation links, AGENTS paths, and CI working/cache paths together and rerun checks. There is no need for a submodule for this single capstone project today.

## Preserving history before any consolidation

In a separate approved migration, first create and verify a Git bundle of all inner refs outside the application folder. Import the original history into a named archive branch/ref in the outer repository, checking its commit count and tip before doing anything to the inner metadata. A history-only fetch does not merge or replace application files. Retain the bundle as an independent backup; a local archive branch is not on GitHub until explicitly pushed.

Only then consider relocating or removing the inner `.git`, with explicit approval. Removing it before preservation would discard its unique commit history, refs, reflogs and local repository configuration; it would leave current source files in place but change which repository handles Git commands. Removing the **outer** `.git` would discard the capstone's local history, branches, remote configuration and index, breaking the intended workflow. Neither action is part of this task. Both directories remain intact.

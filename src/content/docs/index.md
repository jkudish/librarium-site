---
title: Getting started
description: Build the pinned RC18 source and run zero-network review checks.
order: 1
---

Librarium 2.0.0-rc.18 plans a request against explicit provider profiles, executes selected work, and records its provenance. The catalog contains 33 built-in providers and exactly 40 implemented public profiles.

## Build the release candidate from source

RC18 is not available from npm, Homebrew, or standalone release channels. Review the exact source commit with Node.js 22.12.0 or newer:

```bash
git clone https://github.com/jkudish/librarium.git librarium-rc18
cd librarium-rc18
git fetch origin 417613e8922fbe74c5e3b239ec02afc0171891a2
git checkout --detach 417613e8922fbe74c5e3b239ec02afc0171891a2
npm ci
npm run build
node dist/cli.js --version
node --experimental-strip-types art/demo/demo-run.mjs
```

The version command must print `2.0.0-rc.18`. The demo command runs the real built CLI through a checked-in, network-denied fixture and must report `"status": "succeeded"`. It does not read credentials, call a provider, or spend money. Keep the checkout detached so review work does not move a branch. Run RC commands through the local build:

```bash
node dist/cli.js config --json
node dist/cli.js ls --json
node dist/cli.js groups --json
node dist/cli.js doctor --json
```

These commands exit successfully in a clean checkout without provider credentials. `doctor` reports unconfigured providers as skipped. The catalog and group commands inspect the local source build only.

A real provider run is not candidate proof. It requires separately configured credentials, reviewed pricing for the selected profiles, and explicit paid-call authority. Follow the [release-candidate review checklist](/docs/release-candidate) before any live review.

Do not assume a v1 config was rewritten. Migration is pure until an explicit save. Read [Configuration](/docs/configuration#migrate-from-v1) before replacing a working v1 setup.

## Plan a later live review

Only `quick`, `deep`, `visibility`, and `all` are built-in v2 workflows. User groups use `custom:<name>`. See [Groups and modes](/docs/groups-and-modes) and [Commands](/docs/commands) before preparing an authorized provider run.

`librarium run --json` writes JSON to stdout. Progress and diagnostics stay on stderr. A result records what an API or collected surface returned. It does not convert agreement or citation count into proof.

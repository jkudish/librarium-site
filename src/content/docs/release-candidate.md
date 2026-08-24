---
title: Release-candidate review
description: Evaluate Librarium 2.0.0-rc.18 without treating the candidate as a stable release.
order: 2
---

This documentation is pinned to Librarium `2.0.0-rc.18` at source commit [`417613e8922fbe74c5e3b239ec02afc0171891a2`](https://github.com/jkudish/librarium/commit/417613e8922fbe74c5e3b239ec02afc0171891a2). The candidate has 33 built-in providers, 40 implemented public profiles, and four built-in workflows. It is not the stable v2 release.

## Review the pinned source checkout

```bash
git clone https://github.com/jkudish/librarium.git librarium-rc18
cd librarium-rc18
git fetch origin 417613e8922fbe74c5e3b239ec02afc0171891a2
git checkout --detach 417613e8922fbe74c5e3b239ec02afc0171891a2
npm ci
npm run build
node dist/cli.js --version
node --experimental-strip-types art/demo/demo-run.mjs
node dist/cli.js config --json
node dist/cli.js ls --json
node dist/cli.js groups --json
node dist/cli.js doctor --json
```

RC18 is not available from npm, Homebrew, or standalone release channels. The source build requires Node.js 22.12.0 or newer, and the version command must print `2.0.0-rc.18`. The demo command drives the real built CLI through a network-denied fixture and must report `"status": "succeeded"`. With no review credentials configured, `doctor` reports providers as skipped. It does not prove account pricing, retention, or future behavior.

A real provider run is a separate review gate, not candidate proof. It requires configured credentials for the selected profiles, reviewed provider pricing and unknown-cost handling, and explicit paid-call authority. Do not infer that authority from completing the source checks above.

## Review migration before saving

V2 config is strict snake_case JSON. `migrateConfig()` and `loadConfigV2()` do not rewrite source files. Inspect notices and issues, keep the v1 file, and save only after you understand renamed provider/profile identities and `custom:<name>` group migration. See [Configuration](/docs/configuration#migrate-from-v1).

## Review the evidence boundary

Use `visibility` only when you want six SearchAPI-collected consumer observations beside three first-party API baselines. Shared collection makes the six observations correlated. A cited URL, repeated source, or matching answer is not independent corroboration by itself.

The offline demo and fixture tests do not validate a live account, provider response, price, privacy setting, or production network. Paid canonical validation has a separate approval and immutable-candidate protocol.

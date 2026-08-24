---
title: Release-candidate review
description: Evaluate Librarium 2.0.0-rc.18 without treating the candidate as a stable release.
order: 2
---

This documentation is pinned to Librarium `2.0.0-rc.18` at source commit [`417613e8922fbe74c5e3b239ec02afc0171891a2`](https://github.com/jkudish/librarium/commit/417613e8922fbe74c5e3b239ec02afc0171891a2). The candidate has 33 built-in providers, 40 implemented public profiles, and four built-in workflows. It is not the stable v2 release.

## Review a package install

```bash
npm install -g librarium@2.0.0-rc.18
librarium --version
librarium config --json
librarium doctor
librarium run "a bounded review query" --group quick --max-cost 0.25
```

Node package installs require Node.js 22.12.0 or newer. Homebrew and standalone binaries include their runtime. Provider calls may cost money and send the query upstream. `doctor` checks configured providers but does not prove account pricing, retention, or future behavior.

## Review migration before saving

V2 config is strict snake_case JSON. `migrateConfig()` and `loadConfigV2()` do not rewrite source files. Inspect notices and issues, keep the v1 file, and save only after you understand renamed provider/profile identities and `custom:<name>` group migration. See [Configuration](/docs/configuration#migrate-from-v1).

## Review the evidence boundary

Use `visibility` only when you want six SearchAPI-collected consumer observations beside three first-party API baselines. Shared collection makes the six observations correlated. A cited URL, repeated source, or matching answer is not independent corroboration by itself.

The offline demo and fixture tests do not validate a live account, provider response, price, privacy setting, or production network. Paid canonical validation has a separate approval and immutable-candidate protocol.

---
title: Getting started
description: Install librarium and run your first research query.
order: 1
---

Librarium 2.0.0-rc.18 plans a request against explicit provider profiles, executes selected work, and records its provenance. The catalog contains 33 built-in providers and exactly 40 implemented public profiles.

## Install the release candidate

The public RC18 evaluation path is the exact npm package. Node installs require Node.js 22.12.0 or newer.

```bash
npm install -g librarium@2.0.0-rc.18
# or
npx librarium@2.0.0-rc.18 run "PostgreSQL connection pooling" --group quick
```

Homebrew and the unversioned standalone installer target the published stable release. RC18 has no published Homebrew formula or standalone release asset. Do not use those channels to evaluate this candidate.

For an existing install, pin the RC while evaluating v2:

```bash
npm install -g librarium@2.0.0-rc.18
librarium --version
librarium config --json
librarium doctor
```

Evaluating the candidate end to end? Follow the [release-candidate review checklist](/docs/release-candidate).

Do not assume a v1 config was rewritten. Migration is pure until an explicit save. Read [Configuration](/docs/configuration#migrate-from-v1) before replacing a working v1 setup.

## Run research

```bash
librarium init
librarium run "PostgreSQL connection pooling" --group quick
librarium answer "What changed in PostgreSQL 17?" --verify
```

Only `quick`, `deep`, `visibility`, and `all` are built-in v2 workflows. User groups use `custom:<name>`. See [Groups and modes](/docs/groups-and-modes).

`librarium run --json` writes JSON to stdout. Progress and diagnostics stay on stderr. A result records what an API or collected surface returned. It does not convert agreement or citation count into proof.

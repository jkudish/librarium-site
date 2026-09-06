---
title: Getting started
description: Install Librarium, configure providers, and run your first query.
order: 1
---

Librarium is a meta harness for research queries. It sends one query to selected search, grounded-answer, and deep-research providers, then writes the results to one run directory.

## Install

Librarium requires Node.js 22.12.0 or newer.

```bash
npm install -g librarium
```

You can also install it with Homebrew or the standalone installer:

```bash
brew install jkudish/tap/librarium
curl -fsSL https://raw.githubusercontent.com/jkudish/librarium/main/scripts/install.sh | sh
```

## Configure providers

Run the setup wizard, then check which providers are ready:

```bash
librarium init
librarium doctor
```

Provider calls can incur charges. Check the selected providers' pricing before running a broad workflow. Missing cost data means the cost is unknown, not zero.

## Run a query

```bash
librarium run "current guidance for HTTP caching" --group quick
```

The command prints progress to stderr and writes the results under `./agents/librarium/`. Add `--json` for machine-readable stdout. Use `librarium browse` to open previous runs.

The built-in workflows are `quick`, `deep`, `visibility`, and `all`. User-defined groups use the `custom:<name>` prefix. See [Groups and modes](/docs/groups-and-modes) for their exact selection rules.

## Moving from v1

V2 configuration uses strict snake_case JSON. Migration previews without changing your v1 file and writes only to an explicit output path. Follow [Upgrade from v1](/docs/upgrading-to-v2) before replacing a working setup.

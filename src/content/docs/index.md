---
title: Getting started
description: Install Librarium, configure providers, and run your first query.
order: 1
---

Librarium is a meta harness for research queries. It sends one query to selected search, grounded-answer, and deep-research providers, then writes the results to one run directory.

## Install

The published v2 CLI requires Node.js 22.12.0 or newer when installed from npm. Install the v2 major, then confirm the executable version:

```bash
npm install -g librarium
librarium --version
# Must report major version 2
```

Homebrew and standalone binaries include their own runtime; npm installs require Node.js 22.12.0 or newer:

```bash
brew install jkudish/tap/librarium
curl -fsSL https://raw.githubusercontent.com/jkudish/librarium/main/scripts/install.sh | sh
```

## Configure providers

Run the setup wizard, then inspect configuration and credential presence offline:

```bash
librarium init
librarium doctor
```

Provider calls can incur charges. Check the selected providers' pricing before running a broad workflow. Missing cost data means the cost is unknown, not zero.

Doctor does not authenticate or load custom provider code unless you explicitly use `--live`; live checks may incur charges. Preview a request before running it:

```bash
librarium plan "current guidance for HTTP caching" --json
```

An admitted plan means local preflight passed, not that an account was authenticated or a price guaranteed. Planning creates no run artifacts and makes no provider calls.

## Run a query

```bash
librarium run "current guidance for HTTP caching" --group quick
```

The command prints progress to stderr and writes the results under `./agents/librarium/`. Add `--json` for machine-readable stdout. Use `librarium browse` to open previous runs.

New requests default to `quick` in `sync` mode, with selected providers running concurrently and awaited. `quick` includes raw `exa/search`, not just AI-grounded answers. Saved mode/limit settings override factory defaults; explicit flags override configuration. Explicit providers take precedence over a group with a notice. Missing quick providers are omitted with diagnostics, not replaced with every enabled provider.

The built-in workflows are `quick`, `deep`, `visibility`, and `all`. User-defined groups use the `custom:<name>` prefix. See [Groups and modes](/docs/groups-and-modes) for their exact selection rules.

## Moving from v1

V2 configuration uses strict snake_case JSON. Migration previews without changing your v1 file and writes only to an explicit output path. Follow [Upgrade from v1](/docs/upgrading-to-v2) before replacing a working setup.

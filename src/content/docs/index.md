---
title: Getting started
description: Set up sources, preview a question offline, and read a stored Run.
order: 1
---

Ask a question, choose quick or deep research, and keep each source's answer, citations, provenance, and cost in one Run.

## Install

The JavaScript v2 npm package requires Node.js 22.12 or newer.

```bash
npm install -g librarium
librarium --version
librarium research --help
```

For an existing installation, see the [migration guide](/docs/upgrading-to-v2).

## Configure sources

```bash
librarium setup
librarium setup --check
librarium sources --json
```

`setup --check` checks local configuration and credential presence without calling providers. Presence does not prove authentication. Keys may be environment references such as `env:EXA_API_KEY`; never paste keys into a question or commit them.

## Preview, then research

```bash
librarium research "Compare current HTTP caching guidance" --only exa --dry-run --json
librarium research "Compare current HTTP caching guidance" --only exa
```

A dry run returns `status: planned`, estimates, and skips. It makes no provider calls and writes nothing to the store. Every real request is stored before its first provider call.

Without `--only`, every configured research source runs at quick depth. Choose AI answer engines by name. Narrow with `--only` or `--skip`; see [costs and limits](/docs/costs-and-limits) before paid research.

## Come back to deep work

```bash
librarium research "Compare database hosting options" --deep --only exa --no-wait
librarium show <run-id> --wait --json
```

Deep tasks keep recovery details in private Run state. `show` picks up the same research rather than submitting again. Quick work usually finishes in the calling process, though some retrieval services support recovery. CLI `--no-wait` requires `--deep`, except for a dry run. Ctrl-C prints a recovery command so you can check the Run later.

Continue with [commands](/docs/commands), [source selection](/docs/groups-and-modes), or [agent integration](/docs/using-with-agents).

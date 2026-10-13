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

Existing 1.x users can read [legacy docs](/v1) and the [migration guide](/docs/upgrading-to-v2).

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

Without `--only`, every set-up research source runs at quick depth; engines never join that default. Narrow with `--only` or `--skip`, and use `--max-cost` for catalog-ordered budget admission. Unknown reported cost is `null`, not zero. In-flight work can exceed a cap.

## Come back to deep work

```bash
librarium research "Compare database hosting options" --deep --only exa --no-wait
librarium show <run-id> --wait --json
```

Deep tasks keep signed handles in private Run state. `show` resumes them rather than submitting again. Quick work usually runs inline, though some collectors are durable. CLI `--no-wait` requires `--deep`, except for a dry run. Ctrl-C detaches and prints a recovery command; it is not a billing guarantee.

Continue with [commands](/docs/commands), [source selection](/docs/groups-and-modes), or [agent integration](/docs/using-with-agents).

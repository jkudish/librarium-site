---
title: Getting started
description: Set up sources, preview a question offline, and read a stored Run.
order: 1
---

Ask a question, choose quick or deep research, and keep each source's answer, citations, provenance, and cost in one Run.

| Work from | Start here |
| --- | --- |
| Coding agent | [MCP setup](/docs/using-with-agents) |
| JavaScript application | [Client API](/docs/library) |
| Laravel application | [PHP docs](/docs/php) |
| Terminal | CLI steps below |

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

`setup --check` checks local configuration and credential presence without calling providers—not authentication. Keys may use environment references such as `env:EXA_API_KEY`; never paste keys into a question or commit them.

## Preview, then research

```bash
librarium research "Compare current HTTP caching guidance" --only exa --dry-run --json
librarium research "Compare current HTTP caching guidance" --only exa
```

A dry run returns `status: planned`, estimates, and skips without provider calls or storage. Every real request is stored before its first provider call.

Without `--only`, every configured research source runs at quick depth. Choose AI answer engines by name. Narrow with `--only` or `--skip`; see [costs and limits](/docs/costs-and-limits) before paid research.

## Come back to deep work

```bash
librarium research "Compare database hosting options" --deep --only exa --no-wait
librarium show <run-id> --wait --json
```

Deep tasks keep recovery details in private Run state; `show` picks up the same research, not a new submission. Quick work usually finishes in the calling process, though some retrieval services support recovery.

### Detach and interrupt

CLI `--no-wait` requires `--deep`, except for a dry run. Ctrl-C prints a recovery command so you can check the Run later.

Continue with [commands](/docs/commands), [source selection](/docs/source-selection), or [agent integration](/docs/using-with-agents).

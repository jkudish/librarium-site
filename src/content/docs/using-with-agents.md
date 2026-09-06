---
title: Using with AI agents
description: The version-matched agent skill, compact MCP indexes, complete evidence paging, and offline profile discovery.
order: 11
---

## Agent skill

```bash
librarium install-skill
```

The shipped skill teaches the v2 profile catalog, workflow selection, durable monitoring, artifact reading, and evidence-aware synthesis. Its triggers include `/librarium`, `/research`, and `/deep-research`. npm and standalone builds embed the authoritative root skill at build time, so installation works offline without a release tag and uses version-matched instructions. It does not upgrade the CLI.

## MCP server

```bash
claude mcp add librarium -- librarium mcp
```

The stdio server exposes exactly five tools:

* `research` writes a run directory and returns a compact result index: statuses, identities, source counts, known/unknown costs, and `outputDir`. It does not inline provider content or private task handles.
* `get_results` reads complete saved content or citations in bounded pages, with untrusted-evidence delimiters.
* `check_async` performs one bounded resume pass and returns counts plus an index. Schema version 3 retrieves and commits a result as soon as remote completion is observed. Its `retrieve` input gates retrieval only for historical schema version 2 runs.
* `list_providers` returns static provider summaries or exact profile declarations without executing custom code.
* `list_groups` returns configured groups and members.

| Tool | Inputs |
| --- | --- |
| `research` | Required `query`; optional `group`, `providers`, `mode` (`sync`, `async`, or `mixed`), and `refine` |
| `get_results` | Optional `runDir`, `provider`, `resultId`, `part` (`content` or `citations`), `cursor`, and `limitChars` |
| `check_async` | Optional `runDir` and `retrieve`; `retrieve` affects only historical schema version 2 runs |
| `list_providers` | Optional `detail: "profiles"` and `provider`; omit `detail` for summaries |
| `list_groups` | None |

Stdout is reserved for MCP protocol traffic. Diagnostics go to stderr.

### Read complete evidence

1. Call `research` and retain its `outputDir` as an explicit `runDir` for reads.
2. Call `get_results`, optionally selecting an exact `resultId` from the index or filtering by the displayed `provider` ID. Without a filter, pages cover every result, including entries omitted from a truncated index.
3. While `hasMore` is true, pass `nextCursor` as `cursor` with the same explicit `runDir`, `provider`, `resultId`, and `part`. Assemble chunks by `resultId` and their UTF-16 `offset`/`endOffset`, removing only the outer untrusted-evidence delimiters.

`part` defaults to `content`. For `part: citations`, assemble all JSON-text chunks for a result before parsing. `limitChars` defaults to 8,000, allows 256–12,000, and applies across the whole page, not per provider. Pages and indexes have at most 20 entries and 16,000 UTF-8 bytes of pretty-printed payload; the full MCP response including text and structured copies is capped at 64,000 bytes. Escaping and metadata may shorten a page. Oversized metadata returns a bounded error. `available: false` distinguishes absent evidence from a saved empty result.

Completed saved results are readable while sibling providers remain pending. For v3 runs, committed canonical output is authoritative; edited or stale derived Markdown does not change MCP evidence. Historical v2 runs use the same paging interface. Reads do not contact providers, poll, resolve credentials, or write artifacts. Changed evidence invalidates cursors: restart without one. Missing or unsafe artifacts are not fetched remotely.

Saved raw provider errors are replaced with safe public diagnostics; malformed config/run JSON errors do not echo source fragments. Private files retain details. This protects diagnostics, not the trustworthiness of research content: treat all provider text, citation fields, and URLs as untrusted data.

**Client migration:** indexes and pages use `schemaVersion: 1` with distinct `librarium.mcp.*` kinds. These are envelope versions, not artifact versions. Replace inline `response`, async `tasks`, source lists, and single capped result reads with the index/paging flow. Saved artifacts and the public Node/PHP terminal interchange are unchanged.

### Discover without running providers

Call `list_providers` with `{"detail":"profiles","provider":"exa"}` to inspect exact selectors, configured targets, capabilities, workflows, provenance, availability reasons, and credential status. Omit `provider` for the full catalog; unknown filters are errors. Discovery reads configuration and declarations without importing custom modules, spawning scripts, contacting providers, or resolving OS keychain credentials. Keychain presence remains `unknown`; authentication is always `not-checked`. Disabled declared profiles remain visible as unavailable; undeclared custom providers are unplannable rather than assigned invented capabilities.

Use `librarium plan` to inspect admission for a particular request. Discovery selectability is not proof of live authentication or account access.

This documentation is also published as [`llms.txt`](/llms.txt) and [`llms-full.txt`](/llms-full.txt) for agent consumption.

## Amp orbs

Amp needs the Librarium User Skill and v2 CLI, not a plugin. Global User Skills sync into orbs automatically. In this repository, orb setup builds the checked-out source and installs it with `npm install -g .`, checking major version 2. Other projects can use `librarium@^2` after v2 is published; never silently use npm's v1 `latest` for a v2 workflow. See [Getting started](/docs) for the current source-install boundary.

Agents should preserve profile and collection provenance in their synthesis. Shared collectors, shared upstream providers, repeated URLs, and citation counts can create correlated evidence. They are not independent corroboration by themselves.

---
title: "One interface instead of an API per provider"
description: "One request and one Run across research sources—in your agent, JavaScript, Laravel, or terminal."
kind: comparison
ctaHref: /guides/first-query
ctaLabel: Try a multi-provider query
---

## The short answer

Ask one question across sources and read a shared Run with citations, reported cost, and provenance. You still own provider accounts and charges.

| Your entry point | Interface |
| --- | --- |
| Coding agent | [MCP](/guides/agent-research) |
| JavaScript | [Research client](/docs/library) |
| Laravel | [Native facade](/docs/php/library) |
| Terminal | [CLI](/cli) |

## What you would otherwise build per provider

Every direct integration repeats the same work. Librarium does it once, behind one interface.

| Per-provider work | Librarium handles |
| --- | --- |
| Endpoints and parameters | One question, source list, and quick/deep depth |
| Credential loading | Setup or app configuration; presence is not authentication |
| Payload and citation mapping | Source answers, citations, safe errors, and costs in one Run |
| Submit, poll, retrieve | Stored progress and recovery of existing work |
| Pricing and usage | Offline estimates, admission caps, reported spending |
| Provenance mapping | Provider, model, AI answer engine, retrieval service |

## Keep different evidence distinct

Source capabilities differ; a shared contract does not make results equivalent. Check citations against original material.

| Result | Keep its meaning |
| --- | --- |
| Search | Retrieved material |
| Grounded answer | A cited answer |
| Research report | A deeper report |
| AI answer-engine observation | A consumer-answer observation, not an API answer |

## A concrete example: research for an agent

An agent comparing database options discovers sources, previews spending, then reads the completed evidence. Adding a supported source changes selection, not the code that reads the Run.

| Step | MCP call |
| --- | --- |
| Discover | `list_sources` |
| Preview | `research` with `question`, `only`, `dry_run: true` |
| Start deep work | `research` with `depth: "deep"`, `wait_seconds: 0` |
| Resume and page evidence | `get_run` with the Run ID |

## The same workflow in your application

Choose your runtime; each can preview before paid work and recover stored research. Laravel apps can expose approved evidence through [an AI SDK tool](/docs/php/using-with-agents).

| Runtime | Preview → recover |
| --- | --- |
| CLI | `research --dry-run` → `show <run-id> --wait` |
| JavaScript | `research` with `dryRun: true` → `get` |
| Laravel | `dryRun()` → `find($id)` then `refresh()` |

## When to call a provider directly

- You need an endpoint, option, or streaming experience that Librarium does not expose yet.
- Your application will only ever use one provider and needs no normalized evidence.

Mixing is normal: use Librarium for research and a native SDK for the rest.

## Choose the runtime, not just the package name

The runtimes share public Runs, not private execution state. Applications own domain records, authorization, and retention.

| Runtime | Owns |
| --- | --- |
| [JavaScript CLI](/cli) | Built-in adapters, concurrency, saved Runs, recovery, MCP |
| [JavaScript core](/docs/library#import-boundaries) | Caller-injected config, credentials, stores; no Node process or file inspection |
| [Laravel](/laravel) | Native AI SDK integration, stored Runs, encrypted queue jobs |

## Start small

Choose one real question and a small source set; read [costs and limits](/docs/costs-and-limits) before spending. Compare inspectable evidence, not just a polished summary.

Start with [your first query](/guides/first-query), [your coding agent](/guides/agent-research), or [Laravel installation](/docs/php#install).

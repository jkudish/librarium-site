---
title: "One interface instead of an API per provider"
description: "Librarium gives research providers one request shape, one result and evidence contract, and one place for budgets, async jobs, and provenance, in the CLI, MCP, JavaScript, and Laravel."
kind: comparison
ctaHref: /guides/first-query
ctaLabel: Try a multi-provider query
---

## The short answer

Librarium is one interface for many research sources. Instead of maintaining separate integrations for Exa, Perplexity, Gemini, Parallel, You.com, and the rest, you write one request: a question, quick or deep depth, and an optional source list. Each answer comes back in a shared Run with citations, honest cost, and provenance. This page describes the unreleased simplified-surface candidate; check installed commands and exports before following it.

The same model works where you build: the [CLI](/cli) and its MCP server for coding agents, the [JavaScript library](/javascript), and the native [Laravel package](/laravel). Adding a supported provider becomes a configuration change, not another integration. Librarium does not replace your provider accounts or their charges.

If you need one provider-exclusive feature that Librarium does not expose, call that provider's API for that piece. You can still use Librarium for everything else.

## What you would otherwise build per provider

Every direct integration repeats the same work. Librarium does it once, behind one interface.

| For each provider | With its native API | With Librarium |
| --- | --- | --- |
| Request | Its own endpoint, auth, parameters, and model or preset names | The same question; select sources with `only`, choose quick/deep variants |
| Credentials | Read and check each key yourself | Configure with `librarium setup` or Laravel config; offline presence is not authentication |
| Results | Map each payload into your own types | One Run with source answers, citations, costs, provenance, and safe errors |
| Citations | Extract them from each format: inline markers, annotations, or source lists | A citation list on every result, attached to the provider that returned it |
| Long-running jobs | Submit, poll, retrieve, and persist accepted handles | CLI: `--deep --no-wait`, then `show <run-id> --wait`; MCP: `get_run`; Laravel: encrypted `queue()` then `find($id)?->refresh()` |
| Recovery | Reconcile failures and possible charges | Resume signed accepted handles; ambiguous submission is not permission to repeat paid work |
| Spend | Interpret each pricing model and usage report | Dry-run offline; `max_cost` skips unpriced sources and admits bounded estimates in catalog order; unknown reported USD stays null |
| Provenance | Decide which provider, model, surface, and collector facts to keep | Structured provenance distinguishes API sources from collected engines |
| Agent access | A tool per provider | MCP has exactly `research`, `get_run`, `list_sources`; Laravel apps can expose an AI SDK tool over approved evidence |

Each result kind (search, grounded answer, research report, surface observation) keeps its own semantics inside that contract. Librarium does not flatten every provider into an identical capability set, and neither route makes a citation correct just because a model returned it: inspect the sources.

## A concrete example: research for an agent

Suppose an agent needs to compare database options across three providers. With direct APIs, your integration picks each endpoint, translates the query three ways, handles accepted jobs and failures three ways, extracts sources from three formats, and decides how to feed it all back to the agent.

With Librarium, the agent calls `list_sources`, previews `research` with `question`, `only`, and `dry_run: true`, then executes within authorized spend. Use `depth: "deep"` and `wait_seconds: 0` to return before reports finish; `get_run` resumes the id and pages source answers and citations. CLI preview is `research --dry-run`. Laravel uses `Librarium::research()->only()->dryRun()` before `run()` or `queue()`. Your application can expose approved evidence through [an AI SDK tool](/laravel#agent).

Switching or adding a provider changes the selection, not the code that reads the results.

## When to call a provider directly

- You need an endpoint, option, or streaming experience that Librarium does not expose yet.
- Your application will only ever use one provider and needs no normalized evidence.

Mixing is normal: use Librarium for research and a native SDK for the rest of the application.

## Choose the runtime, not just the package name

The [JavaScript CLI runtime](/cli) includes built-in adapters, concurrent research, saved Runs, durable recovery, and MCP. The [JavaScript core](/javascript) constructs a research client with caller-injected configuration, credentials, and stores; it never inspects Node process state or files.

The [Laravel package](/laravel) is native PHP: Laravel AI SDK integration, stored Runs, and encrypted queue jobs. It is not a Node wrapper or MCP server. Both share semantic interchange, not private execution state; applications own domain records, authorization, and retention.

Both implementations distinguish unknown pricing from zero. Their budget controls are admission checks, not a promise about the final provider bill. Provider coverage and operational behavior are documented separately; inspect the relevant docs before switching.

## Start small

Choose one real question, the smallest useful provider set, and an explicit spending policy. Keep the returned evidence and compare the work required to inspect it, not just the quality of a polished summary.

Install JavaScript v2 with `npm install -g librarium`, then follow [your first multi-provider query](/guides/first-query) or [connect your coding agent](/guides/agent-research). For Laravel, see [the PHP install guide](/docs/php#install).

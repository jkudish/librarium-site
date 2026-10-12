---
title: "One interface instead of an API per provider"
description: "Librarium gives research providers one request shape, one result and evidence contract, and one place for budgets, async jobs, and provenance, in the CLI, MCP, JavaScript, and Laravel."
kind: comparison
ctaHref: /guides/first-query
ctaLabel: Try a multi-provider query
---

## The short answer

Librarium is one interface for many research providers. Instead of wiring and maintaining a separate integration for Exa, Perplexity, Gemini, Parallel, You.com, and the rest, you write one request: a question plus the Profiles or workflow (`quick`, `deep`, `visibility`, `all`) you want. Every provider's answer comes back in one result and evidence contract, with its content, citations, usage, and provenance attached. Budgets, long-running async jobs, and provenance live in one place instead of once per integration.

The same model works where you build: the [CLI](/cli) and its MCP server for coding agents, the [JavaScript library](/javascript), and the native [Laravel package](/laravel). Adding a supported provider becomes a configuration change, not another integration. Librarium does not replace your provider accounts or their charges.

If you need one provider-exclusive feature that Librarium does not expose, call that provider's API for that piece. You can still use Librarium for everything else.

## What you would otherwise build per provider

Every direct integration repeats the same work. Librarium does it once, behind one interface.

| For each provider | With its native API | With Librarium |
| --- | --- | --- |
| Request | Its own endpoint, auth, parameters, and model or preset names | The same query; select a Profile such as `exa/research`, or a workflow |
| Credentials | Read and check each key yourself | Configured once (`librarium init`, or Laravel AI config); a Profile without its credential is reported unavailable instead of being called |
| Results | Map each payload into your own types | One terminal result per provider: content, citations, usage, and provenance |
| Citations | Extract them from each format: inline markers, annotations, or source lists | A citation list on every result, attached to the provider that returned it |
| Long-running jobs | Submit, poll, retrieve, and persist task IDs, without resubmitting paid work | CLI: `--mode async` with `status --wait --retrieve`; MCP: `check_async`; Laravel: encrypted `queue()` jobs, or `submit()` and `retrieve()` handles |
| Retries, deadlines, fallbacks | Write the policy per provider | One policy defined by the runtime, under one request-wide deadline |
| Spend | Interpret each pricing model and usage report | Preview known and unknown cost before dispatch; `--max-cost` and `maxCost()` admission checks; unknown stays unknown, never zero |
| Provenance | Decide which provider, model, surface, and collector facts to keep | Structured provenance on every result, including the effective Profile and any shared collector |
| Agent access | A tool per provider | One MCP server with five tools, or one Laravel AI SDK tool over approved evidence |

Each result kind (search, grounded answer, research report, surface observation) keeps its own semantics inside that contract. Librarium does not flatten every provider into an identical capability set, and neither route makes a citation correct just because a model returned it: inspect the sources.

## A concrete example: research for an agent

Suppose an agent needs to compare database options across three providers. With direct APIs, your integration picks each endpoint, translates the query three ways, handles accepted jobs and failures three ways, extracts sources from three formats, and decides how to feed it all back to the agent.

With Librarium, the agent calls `list_groups`, runs `research` with `group: "deep"` and `mode: "async"`, advances it with `check_async`, and reads every provider's content and citations with `get_results`. Over the CLI, `librarium plan` previews the same request offline first. In Laravel, the facade does the same with `Librarium::query()->using()->preview()` before `run()` or `queue()`, and you expose approved evidence through [an AI SDK tool](/laravel#agent) you write in your application.

Switching or adding a provider changes the selection, not the code that reads the results.

## When to call a provider directly

- You need an endpoint, option, or streaming experience that Librarium does not expose yet.
- Your application will only ever use one provider and needs no normalized evidence.

Mixing is normal: use Librarium for research and a native SDK for the rest of the application.

## Choose the runtime, not just the package name

The [JavaScript CLI runtime](/cli) includes built-in adapters, concurrent research, paid-attempt accounting, saved evidence, durable async recovery, and the MCP server. The [JavaScript core](/javascript) offers Worker-safe schemas and contracts with caller-injected bindings and execution dependencies, not a one-call runner.

The [Laravel package](/laravel) is native PHP: sequential Profile execution, Laravel AI SDK integration, encrypted queue jobs, and application-owned persistence. It is not a Node wrapper and does not include the JavaScript MCP server.

Both implementations distinguish unknown pricing from zero. Their budget controls are admission checks, not a promise about the final provider bill. Provider coverage and operational behavior are documented separately; inspect the relevant docs before switching.

## Start small

Choose one real question, the smallest useful provider set, and an explicit spending policy. Keep the returned evidence and compare the work required to inspect it, not just the quality of a polished summary.

Install JavaScript v2 with `npm install -g librarium`, then follow [your first multi-provider query](/guides/first-query) or [connect your coding agent](/guides/agent-research). For Laravel, see [the PHP install guide](/docs/php#install).

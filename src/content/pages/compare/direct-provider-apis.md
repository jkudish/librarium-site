---
title: Librarium or direct provider APIs?
description: Use a provider directly when one integration is enough. Use Librarium when the research workflow spans providers—and the evidence needs to stay together.
kind: comparison
ctaHref: /guides/first-query
ctaLabel: Try a multi-provider query
---

## The short answer

If you need one provider's distinctive feature and already know how you will use its output, its native API is often the best starting point. You get the complete provider-specific interface and fewer dependencies.

Librarium earns its place when you repeatedly ask several providers, compare different answer or search surfaces, preserve citations and provenance, or need a consistent research workflow for an agent. It does not replace your provider accounts or remove their charges.

## What changes when you add another provider?

| Responsibility | Direct APIs | Librarium |
| --- | --- | --- |
| Request shape | Work with each native API | Select Profiles through the chosen Librarium runtime |
| Results and citations | Normalize and preserve them yourself | Consume a shared terminal result contract |
| Provider-specific features | Native access as the provider exposes them | Limited to the selected adapter/Profile's supported behavior |
| Provenance | Decide which provider, surface, and collector facts to keep | Retain structured provenance where available |
| Execution policy | Implement retries, deadlines, and fallback selection | Use the implementation's defined policy; JS and PHP differ |
| Pricing | Interpret estimates and reported usage yourself | Inspect known/unknown costs and available admission controls |
| Application storage | Yours | Still yours for library integrations; CLI owns its run directory |

Neither route makes a citation correct just because a model returned it. Both need source inspection and application-level trust controls.

## A concrete example: research for an agent

Suppose an agent needs to compare database options. With direct APIs, your integration chooses each endpoint, translates the query, handles accepted jobs and failures, extracts sources, and decides how to feed results back to the agent.

With the Librarium CLI/MCP runtime, you select a workflow, preview it, authorize execution, and read the resulting content and citation pages. In Laravel, use the facade and expose approved evidence through [an AI SDK tool](/laravel#let-an-ai-sdk-agent-inspect-the-evidence).

The benefit is reusing the research workflow—not forcing every provider into an identical capability set or replacing the agent framework.

## Where direct APIs remain the better fit

- You rely on an endpoint or option that Librarium does not expose.
- Your application uses only one provider and has little normalization or orchestration work.
- You need a provider-specific streaming experience or immediate access to a new native feature.
- You already have a mature execution and evidence layer and do not want another dependency.

You can also mix approaches. Use Librarium for research and a native provider SDK for the rest of the application.

## Choose the runtime, not just the package name

The [JavaScript CLI runtime](/cli) includes built-in adapters, concurrent research, paid-attempt accounting, saved evidence, and durable async recovery. The [JavaScript core](/javascript) offers Worker-safe primitives with caller-injected bindings and execution dependencies, not a one-call runner.

The [Laravel package](/laravel) is native PHP: sequential Profile execution, Laravel AI SDK integration, encrypted queue jobs, and application-owned persistence. It is not a Node wrapper and does not include the JavaScript MCP server.

Both implementations distinguish unknown pricing from zero. Their budget controls are not a promise about the final provider bill. Provider coverage and operational behavior are documented separately; inspect the relevant docs before switching.

## Start small

Choose one real question, the smallest useful provider set, and an explicit spending policy. Keep the returned evidence and compare the work required to inspect it—not just the quality of a polished summary.

Install JavaScript v2 with `npm install -g librarium@^2`, then follow [your first multi-provider query](/guides/first-query) or [connect your coding agent](/guides/agent-research). The first-party PHP package retains its separate [install-after-release guidance](/docs/php#install-after-release).

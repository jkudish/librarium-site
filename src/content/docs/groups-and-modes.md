---
title: Depth, sources, and groups
description: Choose quick or deep variants, name engines explicitly, and save source lists.
order: 6
---

## Depth chooses variants

`quick` is the default: search and cited answers, usually inline. `deep` selects durable research reports, often taking minutes. A source without a deep variant is skipped as `no_deep_variant`. Execution type belongs to the variant or collector, not depth: quick engine collectors can also use durable tasks.

```bash
librarium research "Current WebGPU support" --only exa,gemini --dry-run
librarium research "Current WebGPU support" --deep --only exa,gemini --no-wait
librarium show <run-id> --wait
```

There are no public execution modes, built-in workflow groups, or fallback reserves.

## Select sources

The default is every set-up research source, never engines. `--only` restricts the set; `--skip` removes members after expansion. An explicitly named unavailable source is an error rather than a silent omission. Inspect `sources --json` for language and variant availability.

```bash
librarium research "HTTP caching guidance" --only exa,claude --skip claude
```

## Save a group

```bash
librarium groups add editorial exa claude
librarium research "HTTP caching guidance" --only editorial
librarium groups remove editorial
```

A group name is an ordinary name, with no `custom:` prefix. It must not conflict with a source or engine. Its members are source names, not provider/profile paths.

## Answer-engine visibility

Name consumer engines explicitly:

```bash
librarium research "Which analytics tools do AI answers recommend?" --only chatgpt,google-ai-mode
librarium groups add visibility chatgpt gemini-app google-ai-mode
```

Engines return `observation: surface`; research APIs return `observation: api`. The collector is configuration, not part of the name. No API baseline joins an engine query automatically. Add a research source yourself if you want a comparison. Shared collectors produce correlated observations, not independent corroboration or a promise about a particular account.

## Budget admission

With `--max-cost`, sources without bounded estimates are `unpriced`. Remaining sources are considered in the order of the shared catalog; each runs if its estimate fits the remaining budget, otherwise it is `over_budget`. Without a cap, unpriced sources can run and the total estimate is `null`. Reported spend plus reservations stops unstarted work; in-flight calls can exceed the cap.

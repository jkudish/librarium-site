---
title: Depth, sources, and groups
description: Choose quick or deep variants, name engines explicitly, and save source lists.
order: 6
---

## Depth chooses variants

`quick` is the default: search and cited answers, usually in the calling process. `deep` selects research reports, often taking minutes. A source without a deep variant is skipped as `no_deep_variant`. Recovery support depends on the variant or retrieval service, not depth: some quick requests can also be resumed.

```bash
librarium research "Current WebGPU support" --only exa,gemini --dry-run
librarium research "Current WebGPU support" --deep --only exa,gemini --no-wait
librarium show <run-id> --wait
```

Choose depth for the type of research and save groups for recurring source selections.

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

## AI answer-engine visibility

Choose AI answer engines by name:

```bash
librarium research "Which analytics tools do AI answers recommend?" --only chatgpt,google-ai-mode
librarium groups add visibility chatgpt gemini-app google-ai-mode
```

AI answer engines return `observation: surface`; research APIs return `observation: api`. Configure the retrieval service separately from the engine name. Add a research source if you want an API comparison. Engines retrieved through the same service are correlated observations, not independent confirmation or a promise about a particular account.

## Budget admission

Use `--max-cost` to limit which sources start; see [costs and limits](/docs/costs-and-limits) for the exact rules and billing caveats.

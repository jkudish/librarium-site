---
title: Research from your terminal.
description: Ask once, preview for free, then research with the sources you choose. Keep every answer with its citations.
kind: product
ctaHref: /docs#install
ctaLabel: Set up the CLI
---

## Ask once. Keep the sources.

This is the unreleased simplified-surface JS 2.0 candidate. The CLI supplies provider connections, stored Runs, cost tracking, and MCP. Check `librarium research --help` before following these examples; a published version may still expose the older commands.

```bash
librarium research "Lisbon or Porto for a long weekend without a car?" --only exa,kagi --dry-run --json
# Can incur charges, after approval:
librarium research "Lisbon or Porto for a long weekend without a car?" --only exa,kagi --max-cost 0.10 --json
```

Dry runs neither store a Run nor call providers. Quick is the default; omit `--only` to use every configured research source, never engines. `--only` and `--skip` accept flat source or saved-group names. No built-in groups, profiles, modes, or fallback reserves remain.

With a cap, unpriced sources are skipped; bounded estimates are admitted greedily in catalog order. In-flight work can exceed the cap. Unknown reported spend is `null`, not zero. See [your first research Run](/guides/first-query).

## Come back later

```bash
librarium research "Which Lisbon and Porto neighborhoods work without a car?" --deep --only exa --no-wait
librarium show <run-id> --wait --json
librarium show <run-id> --source exa
```

`--deep` chooses report variants. `--no-wait` requires deep except for dry runs. Quick usually runs inline, but some collectors are durable. Depth and invocation are distinct.

Accepted handles stay in private signed state; `show` resumes them rather than paying for another submission. Ctrl-C detaches and prints the recovery command. It does not prove upstream work stopped or that no charge occurred. An ambiguous submission requires reconciliation, not a blind retry.

## Read and export

Each Run has `run.json`, `state.json`, source answers under `answers/`, and redacted exchanges under `evidence/`. `show` and `summarize` use the latest Run if no id is supplied.

```bash
librarium browse
librarium html <run-id> --output report.html
librarium usage
librarium cleanup --dry-run
```

Treat answers and URLs as untrusted evidence. `summarize --verify` is a separate paid operation, creates a new Run with `summary_of`, and does not overwrite collected answers.

## Set up once

Requires Node.js 22.12+. After installing a compatible candidate or release:

```bash
librarium setup
librarium setup --check
librarium sources --json
```

These checks are offline. `setup --live` is separate and can spend. The MCP server and bundled skill ship with the same install; see [Agents & MCP](/agents). Laravel is a [separate native package](/laravel).

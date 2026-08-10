---
title: Getting started
description: Install librarium and run your first research query.
order: 1
---

## What is librarium?

Librarium fans out research queries to multiple search and deep-research APIs in parallel, then merges everything into one structured output. It ships with 31 built-in provider adapters spanning traditional search engines, AI-grounded answers, answer-engine visibility surfaces, deep-research APIs, and an opt-in LLM tier. Librarium works both as a CLI and as an embeddable library via `librarium/core`, which runs in Cloudflare Workers and other edge runtimes.

## Installation

### npm

Requires Node.js 22.12 or later.

```bash
npm install -g librarium
```

### pnpm

```bash
pnpm install -g librarium
```

### yarn

```bash
yarn global add librarium
```

### Homebrew (macOS and Linux)

```bash
brew install jkudish/tap/librarium
```

### Standalone binary

```bash
curl -fsSL https://raw.githubusercontent.com/jkudish/librarium/main/scripts/install.sh | sh
```

### npx (no install required)

```bash
npx librarium run "your query"
```

## Quick start

The easiest way to get started is to run `librarium` with no arguments in a terminal. It launches an interactive wizard: enter your query, pick a provider group, choose a mode, and kick off the run -- all with guided prompts.

```bash
librarium
```

Or run `init --auto` once to discover API keys already present in your
environment and enable eligible providers. Higher-cost LLM, SearchAPI answer,
and Perplexity Pro Search adapters remain opt-in even when they share a
discovered key.

```bash
librarium init --auto

# Fan out a research query across providers (live results table)
librarium run "PostgreSQL connection pooling best practices"

# Or get one grounded, cited answer synthesized from the results
librarium answer "what changed in postgres 17 logical replication"

# Use a specific group
librarium run "React Server Components" --group quick

# Compare nine answer-engine surfaces deliberately
librarium run "How do AI assistants describe our product?" --group visibility

# Check async deep research status
librarium status --wait
```

The six SearchAPI members of `visibility` share one collection vendor, so treat
their agreement as correlated observation rather than independent
corroboration. See [provider provenance and privacy](/docs/providers#ai-grounded-answer-behavior).

## Upgrade

`librarium upgrade` auto-detects your install method (npm, pnpm, yarn, Homebrew, standalone) and runs the correct upgrade command.

```bash
librarium upgrade
```

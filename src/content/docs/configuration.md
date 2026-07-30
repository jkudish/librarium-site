---
title: Configuration
description: Layered config system, global and project config examples, API key resolution, and setup commands.
order: 6
---

## Layered configuration

Librarium uses a three-layer configuration system:

1. **Global config.** `~/.config/librarium/config.json`
2. **Project config.** `.librarium.json` in the current directory.
3. **CLI flags.** Passed directly to commands.

Each layer overrides the previous one:

- `defaults`: project overrides global.
- `providers`: deep-merged by provider ID; project overrides keys on conflict.
- `customProviders`: merged by provider ID; project overrides global on same ID.
- `trustedProviderIds`: union and dedupe across global and project.
- `groups`: project overrides global group names on conflict.

## Global config example

```json
{
  "version": 1,
  "defaults": {
    "outputDir": "./agents/librarium",
    "maxParallel": 6,
    "timeout": 30,
    "asyncTimeout": 1800,
    "asyncPollInterval": 10,
    "mode": "mixed",
    "maxCostUsd": 0.5
  },
  "providers": {
    "perplexity-sonar-pro": {
      "apiKey": "$PERPLEXITY_API_KEY",
      "enabled": true
    },
    "brave-answers": {
      "apiKey": "$BRAVE_API_KEY",
      "enabled": true
    },
    "exa": {
      "apiKey": "$EXA_API_KEY",
      "enabled": true
    },
    "grok": {
      "apiKey": "$XAI_API_KEY",
      "enabled": true
    },
    "tavily": {
      "apiKey": "$TAVILY_API_KEY",
      "enabled": true
    }
  },
  "customProviders": {},
  "trustedProviderIds": [],
  "groups": {
    "my-custom-group": ["perplexity-sonar-pro", "exa"]
  }
}
```

The optional `defaults.maxCostUsd` key sets a default cost budget for runs -- the runtime circuit breaker described in [Spend guardrails](/docs/commands#spend-guardrails). The `--max-cost` flag wins over it. Omit it for no limit.

The optional `defaults.maxEstimatedCostUsd` key sets a default *pre-dispatch reservation* ceiling -- the estimated budget described in [Metering registry and the estimated budget](/docs/commands#metering-registry-and-the-estimated-budget). The `--max-estimated-cost` flag wins over it. It is fully independent of `maxCostUsd` (the two never reconcile). Omit it for no limit.

To make estimates for request- or credit-priced providers exact instead of using the built-in defaults, set pricing in that provider's `options`: `perRequestUsd` for request-priced providers, or `creditUsd` plus `creditsPerRequest` for credit-priced ones. A configured price raises the estimate's `costConfidence` from `estimated` to `configured`.

## API key resolution

API keys use the `$ENV_VAR` pattern. The value `"$PERPLEXITY_API_KEY"` resolves to `process.env.PERPLEXITY_API_KEY` at runtime. Keys are never stored in plaintext.

## Model overrides

Claude defaults to Sonnet 5 with a 16,000-token output ceiling, adaptive
thinking, and `medium` effort. The larger ceiling leaves room for both thinking
and the visible answer; it is a cap, not a target:

```json
{
  "providers": {
    "claude": {
      "apiKey": "$ANTHROPIC_API_KEY",
      "enabled": true,
      "model": "claude-sonnet-5",
      "options": {
        "maxTokens": 16000,
        "thinking": "adaptive",
        "effort": "medium"
      }
    }
  }
}
```

`maxTokens` must be a positive integer. `thinking` accepts `adaptive` or
`disabled`; `effort` accepts `low`, `medium`, `high`, `xhigh`, or `max`.
Adaptive thinking and medium effort are automatic only for the default Sonnet
5 model. When `model` is overridden, thinking and effort are omitted unless
explicitly configured, avoiding unsupported fields on older models.

OpenAI Research defaults to GPT-5.6 Sol with `xhigh` reasoning and OpenAI's
standard web-search return-token budget. Configure its model and research
limits under the canonical `openai-research` provider ID:

```json
{
  "providers": {
    "openai-research": {
      "apiKey": "$OPENAI_API_KEY",
      "enabled": true,
      "model": "gpt-5.6-sol",
      "options": {
        "reasoningEffort": "high",
        "maxToolCalls": 5,
        "returnTokenBudget": "default"
      }
    }
  }
}
```

`reasoningEffort` accepts `none`, `low`, `medium`, `high`, `xhigh`, or `max`
and defaults to `xhigh`. `maxToolCalls` must be a positive integer when set.
`returnTokenBudget` accepts `default` or `unlimited` and defaults to `default`.
Use `unlimited` only for high-effort research that needs to inspect unusually
large amounts of web content; it can increase latency and token usage.

Some providers support optional model overrides. Gemini Deep Research defaults to the `deep-research-preview-04-2026` agent; set `model` to `deep-research-max-preview-04-2026` for the heavier (and more expensive) variant:

```json
{
  "providers": {
    "gemini-deep": {
      "apiKey": "$GEMINI_API_KEY",
      "enabled": true,
      "model": "deep-research-max-preview-04-2026"
    }
  }
}
```

Grok (xAI) also accepts a `model` key. It requires `XAI_API_KEY` and defaults to `grok-4.5`; set `model` to `grok-4.3` for cost-sensitive runs:

```json
{
  "providers": {
    "grok": {
      "apiKey": "$XAI_API_KEY",
      "enabled": true,
      "model": "grok-4.3"
    }
  }
}
```

The llm-tier providers (`claude`, `openai-chat`, `gemini-chat`, `openrouter-chat`) each accept a per-provider `model` key the same way. See [Providers](/docs/providers#the-llm-tier) for their defaults.

## Query refinement config

The `refine` key configures which provider and model are used when `librarium run --refine` or `librarium refine` rewrites a query into tier-tuned variants. By default the LLM call cascades through the first available of OpenAI, Gemini, or Perplexity by configured API key. Pin a specific provider and model with:

```json
{
  "refine": {
    "provider": "openai",
    "model": "gpt-4o-mini"
  }
}
```

Setting an explicit `provider` disables the cascade and uses only the named provider. If refinement fails for any reason, the run proceeds with the original query unchanged.

## Answer synthesis config

The `answer` key configures which provider and model are used when [`librarium answer`](/docs/commands#answer) (or the wizard's synthesis toggle) synthesizes a grounded answer from the fan-out results. It has the same shape as `refine`. When unset, `answer` falls back to the `refine` config, and then to the defaults (the first available of OpenAI `gpt-5-mini`, Gemini `gemini-2.5-flash`, or Perplexity `sonar` by configured API key):

```json
{
  "answer": {
    "provider": "gemini",
    "model": "gemini-2.5-flash"
  }
}
```

Synthesis fails open: if the LLM call fails, the run results still stand and a warning prints.

## Project config example

Place `.librarium.json` in the root of any project to override settings for that context:

```json
{
  "defaults": {
    "outputDir": "./research",
    "timeout": 60
  },
  "providers": {
    "perplexity-sonar-pro": {
      "enabled": false
    },
    "my-script-provider": {
      "enabled": true
    }
  },
  "customProviders": {
    "my-script-provider": {
      "type": "script",
      "command": "node",
      "args": ["./scripts/librarium-provider.mjs"]
    }
  },
  "trustedProviderIds": ["my-script-provider"],
  "groups": {
    "project-research": ["my-script-provider", "exa"]
  }
}
```

## Inspect resolved config

Use `librarium config` to print the resolved configuration after merging global and project layers:

```bash
# Show resolved config
librarium config

# Show only global config
librarium config --global

# Output raw JSON
librarium config --json
```

## init

Set up librarium configuration. Auto mode discovers API keys from your environment and enables matching providers.

```bash
# Auto-discover (non-interactive)
librarium init --auto

# Interactive setup
librarium init
```

`init` never enables llm-tier providers by default: `init --auto` skips them even when their key is present (printing them as found-but-opt-in), and interactive `init` lists them unchecked. See [the llm tier](/docs/providers#the-llm-tier).

## doctor

Health check: tests API connectivity for all enabled providers.

```bash
librarium doctor [--json]
```

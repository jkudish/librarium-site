---
title: Groups and execution modes
description: Select one flat Profile set and understand sequential execution.
order: 5
---

Every query compiles exactly one primary selector. Choose a Profile, a group,
an explicit fan-out list, or semantic matching. Selectors cannot be combined.

```php
use Jkudish\LaravelAiLibrarium\Facades\Librarium;
use Jkudish\LaravelAiLibrarium\Responses\Enums\ResultKind;

Librarium::query($query)->using('gemini-grounded');
Librarium::query($query)->group('quick');
Librarium::query($query)->fanOut(['exa', 'kagi-fastgpt']);
Librarium::query($query)->matching(resultKind: ResultKind::ResearchReport);
```

Profile IDs are flat package-native strings such as `gemini-grounded`; PHP does
not require a provider/profile path syntax.

## Built-in groups

`quick` is the default and preserves this order:

1. `gemini-grounded`
2. `openrouter-grounded`
3. `brave-answers`
4. `exa`
5. `kagi-fastgpt`

`visibility` contains the six SearchAPI surface Profiles followed by
`perplexity-sonar-pro`, `gemini-grounded`, and `grok`.

`deep` is derived from all configured Profiles whose result kind is
`research_report`; currently these are `you-research-research`,
`openai-research`, and `perplexity-sonar-deep`. `all` is derived from every
configured Profile. Disabled or unavailable members are reported and omitted
from execution.

Application groups are ordered Profile ID lists under `librarium.groups` and
are selected as `custom:<name>`:

```php
'groups' => [
    'editorial' => ['exa', 'gemini-grounded'],
],
```

```php
$pending = Librarium::query($query)->group('custom:editorial');
```

## Sequential, not concurrent

Groups and fan-out execute eligible primaries sequentially in compiled order
under one request-wide deadline. Do not size deadlines or worker capacity as if
Profile calls run concurrently. Each successful slot contributes one result;
failed slots contribute errors, producing `succeeded`, `partial`, or `failed`.

## Fallback reserve

Fallbacks are a separate ordered reserve, not additional primary fan-out:

```php
Librarium::query($query)
    ->using('gemini-grounded')
    ->fallbacks(['openrouter-grounded']);
```

A fallback must be semantically compatible with at least one primary, cannot
duplicate a primary, and is tried only after a Driver failure that permits
fallback. The runtime uses each fallback Profile at most once across the whole
request. `fallback_reason` records why the effective Profile replaced the
requested one.

Call `preview()` before `run()` or `queue()` to inspect the final ordered
selection, unavailable members, fallback reserve, prompts, deadline, and
pricing assumptions.

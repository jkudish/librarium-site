---
title: Costs and limits
description: Preview spending, understand PHP budget selection, and distinguish estimates from reported charges.
order: 6
---

## Preview without spending

Facade `dryRun()` and Artisan `--dry-run` resolve selection and estimates locally. They make no provider calls and store no Run. They do not test authentication or guarantee a provider's current availability.

## How a cap selects sources

`maxCost('0.10')` and Artisan `--max-cost=0.10` set a USD admission cap. Sources without bounded estimates are skipped as `unpriced`. Librarium considers remaining sources in shared catalog order, not request order or cheapest-first order. Each source is selected if its estimate fits the remaining budget; otherwise it is skipped as `over_budget`, and later sources are still considered.

For example, a $0.10 cap with catalog-ordered estimates of $0.06, $0.05, and $0.03 selects the first and third sources. This example is illustrative, not a price quote. Without a cap, unpriced sources may run and the total estimate can be `null`.

PHP executes selected sources sequentially. Reported spend and reservations stop unstarted work when the budget is used. Failed sources are not automatically replaced.

## A cap is not a final-bill guarantee

In-flight work can exceed a cap. Failed, interrupted, or timed-out calls can still bill. Local timeout and worker termination do not cancel provider work. Keep the Run ID and recover the existing attempt before considering a new paid request. See [recovery](/docs/php/request-and-retry) and [queue deadlines](/docs/php/configuration#queue-and-deadlines).

## Read money and unknowns

Money is an exact USD decimal string. `cost.estimated` is not a receipt. `cost.reported` is provider-reported spend only; `null` means unknown, never zero. Estimates do not fill in missing charges. `cost.complete` requires every result to report a cost.

Estimates come from `jkudish/laravel-ai-pricing`. Pricing synchronization is explicit, not a dry-run side effect. Your SDK agent's model calls have a separate budget from Librarium research. Your application owns authorization and total spend limits across repeated requests.

## Examples and approval

Output labelled **Illustrative** shows a possible response shape, not a captured result or a current price. Preview before spending, obtain approval for agent-initiated paid calls, and keep keys out of chat and source control.

---
title: Costs and limits
description: Preview spending, understand PHP budget selection, and distinguish estimates from reported charges.
order: 6
---

## Preview without spending

Facade `dryRun()` and Artisan `--dry-run` resolve selection and estimates locally. They make no provider calls and store no Run. They do not test authentication or guarantee a provider's current availability.

## How a cap selects sources

`maxCost('0.10')` and Artisan `--max-cost=0.10` set a USD admission cap. Admission uses shared catalog order, not request order or cheapest-first order.

| Estimate | Admission |
| --- | --- |
| No bounded estimate | Skip as `unpriced` |
| Fits remaining budget | Select |
| Exceeds remaining budget | Skip as `over_budget`; consider later sources |

### Illustrative selection

A $0.10 cap with catalog-ordered estimates of $0.06, $0.05, and $0.03 selects the first and third sources. This is not a price quote.

### Unpriced and already-started work

Without a cap, unpriced sources may run and the total estimate can be `null`. PHP executes selected sources sequentially; reported spend and reservations stop unstarted work when the budget is used, without replacing failed sources.

## A cap is not a final-bill guarantee

In-flight work can exceed a cap. Failed, interrupted, or timed-out calls can still bill. Local timeout and worker termination do not cancel provider work. Keep the Run ID and recover the existing attempt before considering a new paid request. See [recovery](/docs/php/request-and-retry) and [queue deadlines](/docs/php/configuration#queue-and-deadlines).

## Read money and unknowns

Money is an exact USD decimal string. Estimates do not fill in missing charges.

| Field | Meaning |
| --- | --- |
| `cost.estimated` | Estimate, not a receipt |
| `cost.reported` | Provider-reported spend only; `null` means unknown, never zero |
| `cost.complete` | Requires every result to report a cost |

### Pricing and separate budgets

Estimates come from `jkudish/laravel-ai-pricing`. Pricing synchronization is explicit, not a dry-run side effect. Your SDK agent's model calls have a separate budget from Librarium research. Your application owns authorization and total spend limits across repeated requests.

## Examples and approval

Output labelled **Illustrative** shows a possible response shape, not a captured result or a current price. Preview before spending, obtain approval for agent-initiated paid calls, and keep keys out of chat and source control.

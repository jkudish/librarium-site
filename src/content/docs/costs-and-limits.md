---
title: Costs and limits
description: Preview spending, understand source selection under a cap, and read unknown costs correctly.
order: 8
---

## Preview without spending

`librarium research --dry-run`, library `dryRun: true`, and MCP `dry_run: true` resolve selection and estimates locally. They make no provider calls and store no Run. They do not test authentication or guarantee a provider's current availability.

## How a cap selects sources

`--max-cost`, library `maxCost`, and MCP `max_cost` set a USD admission cap. Admission uses shared catalog order, not selection order or cheapest-first order.

| Estimate | Admission |
| --- | --- |
| No bounded estimate | Skip as `unpriced` |
| Fits remaining budget | Select |
| Exceeds remaining budget | Skip as `over_budget`; consider later sources |

### Illustrative selection

With a $0.10 cap, catalog-ordered estimates of $0.06, $0.05, and $0.03 select the first and third sources. This is not a price quote.

### Unpriced and already-started work

Without a cap, unpriced sources may run and the total estimate can be `null`. Reported spend and reservations for started work stop further starts when the budget is used; failed sources are not automatically replaced.

## A cap is not a final-bill guarantee

In-flight work can exceed the cap, and failed or interrupted calls can still incur charges. Stopping the local process does not cancel upstream work or refund spending. Preserve the Run ID and recover the existing attempt instead of submitting another paid request; see [requests and recovery](/docs/request-and-retry).

MCP calls can lower but not raise the configured cap. MCP waiting defaults to 45 seconds and is limited to 50 seconds per call; zero returns without waiting for completion. Waiting limits response time, not the provider's bill.

## Read money and unknowns

Money is an exact USD decimal string. Usage totals cannot establish a complete bill when costs are missing.

| Field | Meaning |
| --- | --- |
| `cost.estimated` | Estimate, not a receipt; never replaces missing reported charges |
| `cost.reported` | Provider-reported spend only; `null` means unknown, never zero |
| `cost.complete` | True only when every result reports its cost |

## Examples and approval

Output labelled **Illustrative** shows a possible shape, not a captured provider result or a current price. Commands that remove dry-run can spend money. Agents must obtain approval before paid calls and keep keys out of chat and source control. See [agent installation ground rules](/install.md).

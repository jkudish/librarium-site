---
title: Costs and limits
description: Preview spending, understand source selection under a cap, and read unknown costs correctly.
order: 8
---

## Preview without spending

`librarium research --dry-run`, library `dryRun: true`, and MCP `dry_run: true` resolve selection and estimates locally. They make no provider calls and store no Run. They do not test authentication or guarantee a provider's current availability.

## How a cap selects sources

`--max-cost`, library `maxCost`, and MCP `max_cost` set a USD admission cap. Sources with no bounded estimate are skipped as `unpriced`. Librarium considers the remaining sources in shared catalog order, not your selection order or cheapest-first order. It selects a source when its estimate fits the remaining budget; otherwise it skips it as `over_budget` and continues considering later sources.

For example, with a $0.10 cap and catalog-ordered estimates of $0.06, $0.05, and $0.03, the first and third sources fit. This example is illustrative, not a price quote. Without a cap, unpriced sources may run and the total estimate can be `null`.

Reported spend and reservations for work already started stop further work from starting when the budget is used. A failed source is not automatically replaced by another source.

## A cap is not a final-bill guarantee

In-flight work can exceed the cap, and failed or interrupted calls can still incur charges. Stopping the local process does not cancel upstream work or refund spending. Preserve the Run ID and recover the existing attempt instead of submitting another paid request; see [requests and recovery](/docs/request-and-retry).

MCP calls can lower but not raise the configured cap. MCP waiting defaults to 45 seconds and is limited to 50 seconds per call; zero returns without waiting for completion. Waiting limits response time, not the provider's bill.

## Read money and unknowns

Money is an exact USD decimal string. `cost.estimated` is an estimate, not a receipt. `cost.reported` records only provider-reported spend; `null` means unknown, never zero. Estimates never replace missing reported charges. `cost.complete` is true only when every result reports its cost. Usage totals cannot establish a complete bill when costs are missing.

## Examples and approval

Output labelled **Illustrative** shows a possible shape, not a captured provider result or a current price. Commands that remove dry-run can spend money. Agents must obtain approval before paid calls and keep keys out of chat and source control. See [agent installation ground rules](/install.md).

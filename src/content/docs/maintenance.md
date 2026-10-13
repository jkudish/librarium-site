---
title: Maintenance
description: Retention, installation upgrades, completions, and skill installation.
order: 8
---

## Retention

```bash
librarium cleanup --dry-run
```

`runs.keep_days` defaults to unset. Preview retention before deleting terminal Runs. Pending task state is custody, not disposable output; removing it does not cancel upstream work. Your application owns privacy and retention policy.

## Upgrade

```bash
librarium upgrade
librarium --version
```

Upgrade follows an existing installation channel. The simplified JS 2.0 surface is still an unreleased candidate; do not assume a channel serves it. Preserve config backups and follow [v1 migration](/docs/upgrading-to-v2).

## Completions and skill

```bash
librarium completions zsh
librarium install-skill --force
```

Skill installation uses the exact bundled instructions without a provider call. It does not upgrade the CLI. Review a forced replacement of existing local skill text before applying it. Amp global skill publication is separate from a local installer.

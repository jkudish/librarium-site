---
title: Maintenance
description: Cleanup, upgrade, and shell completions.
order: 8
---

## Upgrade and pin

`librarium upgrade` follows the detected installation method and release channel. Check or preview that channel before changing an installed stable release:

```bash
librarium upgrade --check
librarium upgrade --dry-run
librarium upgrade
```

These commands follow the current npm, pnpm, yarn, Homebrew, or standalone release channel. Use `--force` only when you intend to bypass the normal version guard. To install or pin the published npm package to the v2 major:

```bash
npm install -g librarium
librarium --version
# Must report major version 2
```

Follow [Upgrade from v1](/docs/upgrading-to-v2) separately. Upgrading the executable is not proof that a v1 config was migrated, reviewed, and activated as v2.

## Cleanup

```bash
librarium cleanup --days 30 --dry-run
librarium cleanup --all --yes
librarium clear --dry-run
```

`cleanup` also accepts `--interactive`, `--output`, and `--json`. `clear` is the all-runs form and accepts `--interactive`, `--dry-run`, `--yes`, `--output`, and `--json`. Deleting a run with pending work removes local custody of its handle. It does not imply remote cancellation.

## Completions and integrations

```bash
eval "$(librarium completions zsh)"
librarium install-skill --dry-run
```

The skill installer accepts `--force` and `--dry-run`. It uses version-matched text embedded in the npm or standalone build and needs no network access. Amp uses a User Skill and the CLI; no plugin installation is required.

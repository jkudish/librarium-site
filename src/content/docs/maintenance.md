---
title: Maintenance
description: Cleanup, upgrade, and shell completions.
order: 8
---

## Upgrade and pin

`librarium upgrade` follows the detected installation method and its published release channel. Check or preview that channel before changing an installed stable release:

```bash
librarium upgrade --check
librarium upgrade --dry-run
librarium upgrade
```

These upgrade commands do not make RC18 available through Homebrew or standalone channels. RC18 has no published formula or standalone release asset. Use `--force` only when you intend to bypass the normal version guard. `--target <version>` is restricted to local or fixture evaluation, requires `--dry-run`, and cannot be combined with `--check`. For RC18 evaluation, pin the exact npm package directly:

```bash
npm install -g librarium@2.0.0-rc.18
```

Review [v1 migration](/docs/configuration#migrate-from-v1) separately. Upgrading the executable is not proof that a v1 config was saved as v2.

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
librarium install-plugin --dry-run
```

Both installers accept `--force` and `--dry-run`.

---
title: Maintenance
description: Cleanup, upgrade, shell completions, and install-skill.
order: 7
---

## cleanup

Remove output directories. By default deletes runs older than 30 days; `--all` deletes every run regardless of age.

```bash
# Delete directories older than 30 days (default)
librarium cleanup

# Custom age threshold
librarium cleanup --days 7

# Preview what would be deleted (count, total size, oldest/newest)
librarium cleanup --dry-run

# Delete every run directory (interactive confirm in a TTY)
librarium cleanup --all

# Pick exactly which runs to delete from a checklist
librarium cleanup -i

# JSON output and an alternate output base dir
librarium cleanup --all --json -o ./agents/librarium
```

In a terminal, `--all` prompts for confirmation (showing run count and total size on disk) before deleting. In a non-interactive context (pipe, CI), pass `--yes` to confirm, otherwise the command refuses to delete. The `-i`/`--interactive` flag opens a multiselect of runs showing date, query, size, and a pending-async marker. Runs that still have pending async tasks are flagged in the list and confirm, since deleting them orphans the server-side task handle. After deleting, the command reports the disk space freed. It never deletes anything outside the resolved output base directory and refuses to operate if that directory resolves to your home directory or a filesystem root.

## clear

Alias for `librarium cleanup --all`: deletes every run directory. Same flags pass through (`--dry-run`, `-i`/`--interactive`, `--yes`, `-o`/`--output`, `--json`).

```bash
# Delete all runs (interactive confirm in a TTY, --yes required in non-TTY)
librarium clear

# Preview everything that would be removed
librarium clear --dry-run

# Interactively pick which runs to clear
librarium clear -i
```

## upgrade

Auto-detects your install method and runs the correct upgrade command.

```bash
librarium upgrade
```

Supports npm, pnpm, yarn, Homebrew, and standalone binary installs.

## completions

Print a static shell completion script covering commands, flags, and the builtin group names.

```bash
# zsh
eval "$(librarium completions zsh)"

# bash
eval "$(librarium completions bash)"

# fish
librarium completions fish > ~/.config/fish/completions/librarium.fish
```

## install-skill

Installs the librarium skill for Claude Code into `~/.claude/skills/librarium`, teaching the agent how to run research workflows with librarium. The skill version matches your installed CLI, falling back to the latest from main.

```bash
librarium install-skill
```

Once installed, Claude Code uses librarium when you ask it to research a topic.

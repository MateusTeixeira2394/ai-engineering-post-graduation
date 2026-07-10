# Git Worktrees

> Summary based on [Git Worktrees by Marco Haber](https://www.marcohaber.dev/blog/git-worktrees)

## What is a Worktree?

A **worktree** is an additional working directory that shares the same Git database (the `.git` folder) as your main project.

By default, Git only lets you check out **one branch at a time** in a working directory. Worktrees remove that limitation: they let you have **multiple branches checked out simultaneously**, each in its own separate folder, all backed by the same repository history.

```
my-project/            # main worktree  → branch: feature/login
my-project-hotfix/     # linked worktree → branch: hotfix-branch
```

## Why It Matters

Worktrees shine whenever you need to **context-switch without losing your current state**:

- **No more `git stash` juggling** — leave your in-progress work exactly as it is (uncommitted changes, running dev server, open files) and handle the interruption in a separate folder.
- **True parallel work** — review a PR, run a build, or test another branch while your feature branch stays untouched.
- **Safer experiments** — run risky operations in an isolated worktree you can simply delete afterward.
- **AI / parallel agents** — tools like Cursor use worktrees to run agents in isolation, keeping your main directory clean until you approve their changes.

Compared to a full second clone, a worktree is **faster and lighter** because it reuses the existing `.git` database instead of duplicating the whole repo.

## Example of Usage

A typical scenario: you're deep in a feature branch with **uncommitted changes** and your dev server running, when a teammate asks for an urgent hotfix.

Instead of stashing and switching branches:

```bash
# 1. Spin up a separate folder checked out to the hotfix branch
git worktree add ../my-project-hotfix hotfix-branch

# 2. Move into it and do the work — your original folder is untouched
cd ../my-project-hotfix
# ...fix, commit, push...

# 3. Clean up when you're done
cd ../my-project
git worktree remove ../my-project-hotfix
```

Your original feature branch, its uncommitted changes, and the running server were never disturbed.

## Cheatsheet

| Action | Command |
| --- | --- |
| Create a worktree for an existing branch | `git worktree add <path> <branch>` |
| Create a worktree + a new branch | `git worktree add -b <new-branch> <path>` |
| List all worktrees | `git worktree list` |
| Remove a worktree | `git worktree remove <path>` |
| Prune stale worktree references | `git worktree prune` |
| Lock a worktree (e.g. on external drive) | `git worktree lock <path>` |
| Unlock a worktree | `git worktree unlock <path>` |
| Move a worktree to a new location | `git worktree move <path> <new-path>` |

> The three essentials from the article are **`add`**, **`list`**, and **`remove`**.

## Gotchas & Best Practices

- **Dependencies don't transfer.** `node_modules` (and similar) are not shared. Run your package manager in every new worktree, e.g. `pnpm install`.
- **Ignored files are missing.** Files in `.gitignore` such as `.env` / `.env.local` won't exist in a new worktree — copy them manually or automate it.
- **One checkout per branch.** A given branch can only be checked out in **one** worktree at a time.
- **Keep worktrees outside the repo folder.** Using a sibling directory (`../my-project-hotfix`) keeps things tidy and avoids nesting issues.
- **Clean up.** Use `git worktree remove` (and `git worktree prune`) so stale references don't accumulate.

## Automating Setup (AI Tools Example)

Cursor runs parallel agents in isolated worktrees (e.g. `~/.cursor/worktrees/your-repo/`), keeping your main directory clean until you approve changes.

You can automate per-worktree setup with `.cursor/worktrees.json`:

```json
{
  "setup-worktree": [
    "pnpm install",
    "cp $ROOT_WORKTREE_PATH/.env.local .env.local"
  ]
}
```

This installs dependencies and copies ignored env files automatically whenever a new worktree is created.

## When to Use (and When Not To)

**Use a worktree when:**
- You have uncommitted work and need to switch context.
- You want to run risky operations you might discard.
- You're using AI tools with parallel execution.

**Stick with a normal `git checkout` when:**
- Your working directory is clean.
- The task is quick and doesn't require running two branches at once.

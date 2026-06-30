---
description: Generate a commit message from staged or unstaged changes
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git diff --staged:*)
---

## Context

- Staged changes: !`git diff --staged --stat`
- Unstaged changes: !`git diff --stat`
- Staged diff: !`git diff --staged`
- Unstaged diff: !`git diff`

## Task

Read the changes above and produce a single commit message. Prefer **staged** changes; if there are no staged changes, use the unstaged changes instead.

Format the message exactly like this:

```
[main-topic] Short imperative title

- Summary of change one
- Summary of change two
- Summary of change three
```

Rules:

- `[main-topic]` is a badge in square brackets describing the dominant theme of the diff, written in **kebab-case** (e.g. `[auth-refactor]`, `[ci-pipeline]`, `[bug-fix]`).
- The title is a concise, imperative-mood summary (~50 chars, no trailing period).
- Each bullet point summarizes a meaningful change in the diff. Group related edits; do not list every line. Use 2–6 bullets.
- Base the message strictly on what the diff actually changes — do not invent or assume changes that aren't present.
- Output only the commit message inside a code block, nothing else.

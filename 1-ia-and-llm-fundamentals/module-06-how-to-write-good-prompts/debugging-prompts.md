# Debugging Prompts: How to Get Unstuck When Building with AI

> **Summary of:** [Lovable — Debugging Prompts](https://docs.lovable.dev/prompting/prompting-debugging)
> **Module:** 06 — How to Write Good Prompts

---

## Why This Matters

Building with AI is fast and fun — **until something breaks**. And it will break.

When it does, most people fall into the same trap: they paste the error back and type *"it doesn't work, fix it"*. The AI guesses, applies a change, breaks something else, and you enter a **debugging loop** — burning time, credits, and patience while the codebase gets more tangled with every "fix".

The difference between a developer who gets stuck for hours and one who resolves the issue in minutes is **not** the AI model. It is the **quality of the debugging prompt**.

Debugging with AI is a **learnable skill**. It combines two things:

1. **Strategic prompt construction** — telling the AI exactly what to look at and how to think.
2. **A systematic method** — understanding the problem *before* changing code.

Treat the AI as a **collaborator**, not a magic button. You steer; it executes.

---

## The Golden Rule: Understand Before You Fix

The single most important habit:

> **Separate the *understanding* phase from the *fixing* phase.**

Ask the AI to explain the root cause *first*. Only after you both understand *why* it broke should any code change happen. This prevents the classic failure where you "fix" the symptom and the real problem resurfaces somewhere else as a brand-new error.

**Bad prompt:**
> "Nothing works, fix it!"

**Good prompt:**
> "The screen has gone blank and I can no longer make edits. Can you check what happened?"

The second one gives the AI *observed behavior* to work from. Specificity is everything.

---

## Step-by-Step: Escaping the Error Loop

When the AI keeps trying and failing on the same error, stop repeating blind attempts and run this sequence:

1. **Switch to Plan / analysis mode.** Stop generating code. Think first.
2. **Ask for the root cause.** *"Explain why this error is happening — don't fix it yet."*
3. **Request the relevant code and types.** Ask the AI to show you the exact code and type information involved.
4. **Apply a targeted fix** based on the shared understanding — not a shotgun change.
5. **Test** in normal/default mode.
6. **If it still fails, return to analysis.** Do not loop on blind fixes.

The whole point: replace *repeated guessing* with *one specifically described problem*.

---

## Step-by-Step: Investigating a Broken Feature

When a feature runs but produces the *wrong* result:

1. **Describe expected vs. actual behavior.** "I expected X, but I got Y."
2. **Ask the AI for a debugging strategy** — how would it investigate this?
3. **Gather the evidence** it asks for: logs, error messages, network calls.
4. **Feed the findings back** to narrow the possibilities.
5. **Fix the identified root cause** — not the surface symptom.

---

## Powerful Debugging Techniques

### 1. Full Codebase Audit (no code changes)

Ask the AI to act like a **code reviewer or architect** and assess the health of the whole project *without editing anything*:

- Find misplaced logic or poorly organized components.
- Evaluate separation of concerns (data, UI, state).
- Flag overly complex sections that violate best practices.
- Return recommendations **prioritized** from critical to optional.

Great for when things feel "off" but you can't point to a single bug.

### 2. Safe Modifications for Critical Sections

For fragile areas — **auth flows, payments** — prepend a caution to your prompt so the AI works carefully:

- State explicitly that the area is critical.
- Ask it to examine dependencies **before** changing anything.
- Require it to **explain its reasoning** before proceeding.
- Require **verification** after implementing.

You are deliberately shifting the AI's mindset from "quick fix" to "cautious surgeon".

### 3. Performance Optimization Analysis

Ask the AI to hunt for:

- Unnecessary database/network calls (e.g. **N+1 queries**).
- Excessive component re-rendering.
- Unoptimized assets slowing load times.
- Opportunities for **caching and memoization**.

---

## When You're Truly Stuck: Advanced Moves

### Rollback Instead of Piling On

If the code has become **too tangled by a series of bad fixes**, stop. It is often **faster to rewind** to a working version and try a different approach than to keep patching.

> **Important:** tell the AI you reverted, so it keeps the correct context.

### Progressive Enhancement

Build in **small, testable increments**. If something breaks, you know *exactly* which small step caused it. Large, multi-part prompts create entangled bugs that are painful to isolate.

### Document the Fix

Once resolved, ask:

> "Summarize what the issue was and how we fixed it."

This builds a historical record that helps with future troubleshooting.

### Know When to Escalate

Recognize when a problem exceeds what you and the AI can solve, and reach out to **community/human support**. Knowing the escalation point is a skill in itself.

---

## Community Debugging Principles (Quick Reference)

These are the mindsets to encode into your prompts:

| Principle | What to ask the AI to do |
|---|---|
| **Surgical changes** | Touch only the relevant code; don't modify working parts. |
| **Trace to source** | Find the actual origin of the error, not the symptom. |
| **Preserve working features** | Treat operational features as locked; require explicit permission to change them. |
| **Respect existing patterns** | Keep naming, architecture, and style consistent. |
| **Check before creating** | Inventory existing components/schemas; reuse instead of duplicating. |
| **Verify solutions** | Test against the original issue, check side effects and edge cases. |
| **Multiple hypotheses** | Form several theories before proposing a solution. |
| **Data flow awareness** | Reason about the full pipeline: database → transformations → UI. |
| **Type safety** | Analyze type definitions; maintain strict checking. |
| **Flag technical debt** | Distinguish a quick fix from a proper solution, and say so. |

---

## The Debugging Prompt Checklist

Before you hit send on a debugging prompt, make sure it:

- [ ] **Specifies the problem scope** clearly.
- [ ] **States expected vs. actual** outcomes.
- [ ] **Includes** relevant error messages or logs.
- [ ] **Requests analysis before implementation.**
- [ ] **Separates** the *understanding* phase from the *fixing* phase.

---

## Key Takeaways

1. **The prompt, not the model, gets you unstuck.** Be specific.
2. **Understand the root cause before touching code.**
3. **Break the loop** — switch to analysis mode instead of blind retries.
4. **Work in small increments** so failures stay isolated.
5. **Rollback beats piling on** when fixes get tangled — and tell the AI you did.
6. **Treat the AI as a collaborator**: keep a dialogue going, feed it evidence, and steer it.

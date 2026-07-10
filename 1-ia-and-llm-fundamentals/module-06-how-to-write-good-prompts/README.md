# Module 06 — How to Write Good Prompts

## Summary

Many people struggle to get useful results from AI tools like ChatGPT. They run
into hallucinations, wrong answers, or the need to repeat the same request over
and over. Most of the time the real problem isn't the model — it's how the
prompt was written.

An LLM doesn't *think* like a human. It's **not deterministic**: it works by
predicting the next most probable token based on the context it receives. When a
prompt is vague or incomplete, the model has to guess what you meant, and that's
where **hallucinations** come from — it invents data, mixes up contexts, or
answers confidently even without enough information to back it up.

> **Example:** Asking *"Who is Eric Wendel?"* with no context might lead the
> model to blend real facts with invented ones — like claiming he wrote Java
> books, which isn't true.

The fix is to **structure your prompt** so the model has less room to guess. The
structure below is inspired by Anthropic's prompt engineering guidance and
breaks a strong prompt into 10 building blocks.

### The 10 building blocks of a structured prompt

| # | Block | What it does |
|---|-------|--------------|
| 1 | **Task context / role** | Defines who the AI is acting as. *"You are Joe, a career coach specialized in transitions into tech."* |
| 2 | **Tone of voice** | Formal? Empathetic? Didactic? Shapes how the model expresses itself. |
| 3 | **Source of truth** | Reference material (docs, rules, tables) the answer must be grounded in, instead of generic internet data. |
| 4 | **Operational contract** | Behavior rules. *"If you're not sure, say you don't know. If data is missing, ask for it."* A safety protocol. |
| 5 | **Examples** | Input/output patterns that anchor the expected format, structure, and edge-case handling. |
| 6 | **User history** | In richer apps, what the user already said — keeps the conversation consistent. |
| 7 | **Clear request** | The actual task. Don't confuse *context* with the *ask* — give one objective instruction. |
| 8 | **Reasoning incentive** | Ask the model to validate or review before answering. Helps on complex tasks. |
| 9 | **Response format** | JSON? Plain text? Table? Be explicit. |
| 10 | **Constraints & validation** | Character limits, response language, required fields, and what to do when a value is missing. |

### Anti-hallucination checklist

- Always define the AI's **role**.
- Provide **real data or documents**, even as plain text.
- Tell the model **not to invent** — it should say when it lacks information.
- Instruct it to **ask questions** when the request is incomplete.
- For ambiguity, have it **list the options and ask you to choose**.

---

## Step by step: how to build a good prompt

1. **Assign a role.** Tell the model who it is and what expertise it brings.
   *"You are a senior TypeScript engineer."*
2. **Set the tone.** State how it should communicate (concise, didactic,
   formal, etc.).
3. **Give the source of truth.** Paste the docs, code, rules, or data the answer
   must rely on. This is the single biggest lever against hallucinations.
4. **Define the operational contract.** Spell out the behavior rules: what to do
   when unsure, when data is missing, or when the request is ambiguous.
5. **Show examples.** Provide one or two input → output pairs so the model knows
   the exact shape you expect.
6. **Write one clear request.** Separate the context from the ask. State the
   single task objectively.
7. **Invite reasoning.** For non-trivial tasks, ask it to plan or review its
   answer before finalizing it.
8. **Specify the output format.** JSON, table, Markdown, code block — be exact.
9. **Add constraints and validation.** Length limits, language, mandatory
   fields, and fallback behavior for missing values.
10. **Iterate.** Read the result, spot what was ambiguous, and tighten that part
    of the prompt.

---

## Example of a good prompt

A weak prompt like *"Write a function to validate an email"* leaves too much
open: which language? what counts as valid? what should it return on failure?

Here's a structured version that removes the guesswork:

```
# Role
You are a senior TypeScript engineer who values readable, well-typed code.

# Tone
Concise and technical. No filler.

# Source of truth
- Runtime: Node.js 20, strict TypeScript (`strict: true`).
- We use Zod for validation across the codebase.
- An email is "valid" if it passes Zod's `.email()` check.

# Operational contract
- If any requirement is ambiguous, ask before writing code.
- Do not invent libraries we don't use. Stick to Zod.

# Request
Write a function `parseEmail(input: string)` that validates an email address.

# Reasoning
Briefly state your approach in one sentence before the code.

# Response format
Return:
1. One sentence describing the approach.
2. A single TypeScript code block.
3. A short usage example.

# Constraints & validation
- The function must return a discriminated union:
  `{ ok: true; email: string } | { ok: false; error: string }`.
- Never throw; always return the union.
- Keep it under 25 lines.
```

Because the role, source of truth, contract, request, format, and constraints
are all explicit, the model has almost nothing left to guess — which is exactly
how you cut down on hallucinations and re-work.

---

## Key takeaway

Well-written prompts save time, reduce re-work, and increase accuracy. This
10-block structure is a solid foundation for using AI more effectively,
especially in professional contexts. Later modules go deeper into prompt
engineering, but this alone is enough to avoid the most common mistakes.

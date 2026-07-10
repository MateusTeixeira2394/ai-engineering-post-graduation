# Spec-Driven Development (SDD)

> A summary based on:
> - [Spec-driven development with AI: Get started with a new open-source toolkit (GitHub Blog)](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
> - [Spec-driven development: Spec Kit (Microsoft Developer Blog)](https://developer.microsoft.com/blog/spec-driven-development-spec-kit)

## What is Spec-Driven Development?

Spec-Driven Development (SDD) is an approach that establishes a project's requirements, motivations, and technical decisions **before** implementation begins. It treats the **specification as a living, executable artifact** — the central source of truth — rather than a static document written once and forgotten.

It is not waterfall planning or exhaustive up-front documentation. A better mental model is **"version control for your thinking"**: it captures the *why* behind architectural choices in a form that is explicit, reviewable, and continuously evolvable.

## Why It's Used

- **AI agents fill gaps with guesses.** Language models excel at pattern completion but struggle with *unstated* requirements. "Vibe-coding" with AI often produces code that "looks right, but doesn't quite work." A clear spec turns the agent into a "literal-minded pair programmer" instead of a guessing search engine.
- **It prevents misaligned assumptions.** Teams frequently waste sprints because people picture different things. (Classic example: a PM imagines channel-specific notification toggles while engineers build a single on/off switch.) An explicit spec surfaces that mismatch *before* code is written.
- **It makes decisions explicit and durable.** Instead of critical decisions living in scattered emails or in one person's head, they become reviewable, evolvable artifacts.
- **It separates the stable *what* from the flexible *how*.** This enables iterative development and even multiple implementations from the same spec (e.g., test a Rust vs. a Go version) without expensive rewrites.

## How It Works

SDD follows a four-phase process with explicit validation checkpoints between phases:

1. **Specify** — Capture the high-level description and desired outcomes, focusing on **user journeys and experiences** (the *what* and *why*), not technical details. The agent produces a comprehensive specification as a living artifact.
2. **Plan** — Define the technical stack, architecture, constraints, and compliance requirements (the *how*). The agent generates a detailed technical plan that respects your organizational standards and existing/legacy systems.
3. **Tasks** — Break the spec and plan into small, independently reviewable and testable chunks, each addressing one specific piece of the puzzle.
4. **Implement** — The agent tackles tasks sequentially. Developers review focused, incremental changes instead of thousand-line code dumps.

## How to Use the Spec Kit

**Spec Kit** is the open-source toolkit that operationalizes SDD. It works with coding agents such as **GitHub Copilot, Claude Code, and Gemini CLI**.

### 1. Initialize the project

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init <PROJECT_NAME>
```

This bootstraps the project with SDD scaffolding — typically `.specify` and `.github` folders — containing templates, helper scripts (PowerShell/Bash), and agent-specific prompts.

### 2. Run the workflow via slash commands

| Command | Purpose |
|---|---|
| `/specify` | Define the **what** and **why** — functional requirements and desired experience, without technical decisions. |
| `/plan` | Define the **how** — frameworks, libraries, databases — grounded by the project constitution. |
| `/tasks` | Break the spec + plan into manageable, agent-executable implementation tasks. |

### Key components created

- **`constitution.md`** — Non-negotiable organizational principles (e.g., testing conventions, CLI-first requirements) that ground every plan.
- **Templates** — Spec, plan, tasks, and agent files, all in plain Markdown.
- **Helper scripts** — Maintain consistency across Git branches and feature management.

### 3. Review and execute

Review and adjust the generated Markdown artifacts as needed, then let the AI agent execute the implementation against the outlined tasks — reviewing focused changes as it goes.

## 3 Places This Approach Works Well

1. **Greenfield / new projects** — Doing the spec work up front ensures the AI builds the intended solution rather than a generic implementation.
2. **Feature work in existing systems** — Considered where SDD is *most powerful*: the spec clarifies how new code interacts with the existing codebase, so additions feel native rather than bolted-on.
3. **Legacy modernization** — Capture the original business logic in a modern spec, design fresh architecture, and rebuild without inheriting the old technical debt.

*(SDD also shines for coordinating distributed teams, onboarding new members with explicit context, exploring multiple design directions in parallel, and establishing organizational conventions.)*

## Key Takeaway

SDD succeeds because it separates the stable *what* from the flexible *how*, turning specifications into executable blueprints that guide AI-assisted development from inception through completion — reducing rework, guesswork, and misalignment.

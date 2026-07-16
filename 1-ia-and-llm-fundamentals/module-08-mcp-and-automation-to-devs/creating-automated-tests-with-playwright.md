# Creating Automated Tests with Playwright + AI

> Source of truth: [Playwright Test Agents](https://playwright.dev/docs/test-agents#agent-definitions)

## What is Playwright

Playwright is an end-to-end testing framework for modern web apps. It drives real browsers (Chromium, Firefox, WebKit) to simulate genuine user interactions — navigating pages, filling forms, clicking, and asserting results — with reliable auto-waiting and cross-browser support.

For AI workflows, Playwright ships an **MCP server** (Model Context Protocol) that lets an AI agent control the browser autonomously: open pages, inspect the DOM, interact with elements, and read results. This is what makes prompt-driven test generation possible.

## How it Helps Generate Automated Tests

Instead of writing test code by hand, you give the AI structured prompts and it does the work through the MCP server:

- **Explores** the page and maps its elements, forms, lists, and buttons.
- **Generates** Playwright test scripts from generic goals (e.g. "validate form submission", "verify the list updates").
- **Runs** the tests and reads the results and reports.
- **Fixes** failures automatically — adjusting selectors and rewriting assertions until tests pass.

The result: significant coverage of critical flows with little or no manually written code.

## The Three Test Agents

Playwright defines three cooperating agents. Each bundles instructions plus MCP tools and can run standalone or chained together in an agentic loop.

| Agent | Role | How it works |
|-------|------|--------------|
| 🎭 **Planner** | Explores the app and produces a test plan | Runs a *seed test* to understand the environment, then outputs a human-readable **Markdown plan** of scenarios and user flows. Can take a Product Requirement Document as input. |
| 🎭 **Generator** | Turns the plan into executable tests | Converts the Markdown specs into real Playwright test files, verifying selectors and assertions **live** against the running app as it writes. |
| 🎭 **Healer** | Fixes failing tests | Replays the failing steps, inspects the current UI for equivalent elements, and suggests patches (locator updates, wait adjustments), rerunning until tests pass or a safeguard stops it. |

**Flow:** Planner → Generator → Healer. The plan is reviewable Markdown, the generator produces the code, and the healer keeps it green as the UI changes.

### Setup

Initialize the agent definitions for your editor/loop:

```bash
npx playwright init-agents --loop=[vscode|claude|codex|opencode]
```

Regenerate these definitions whenever you upgrade Playwright, since they carry the current instructions and MCP tools.

## Why It Matters for Frontend Developers

- **Productivity** — meaningful test coverage with near-zero handwritten code.
- **Standardization** — consistent project scaffolding and CI setup.
- **Real validation** — tests actually run and are documented, not just generated.
- **Self-healing** — agents repair common failures (broken selectors, timing) automatically.
- **CI/CD ready** — the same prompts can scaffold a GitHub Actions workflow, wiring tests into your delivery pipeline.

## Takeaway

Combining **prompt engineering**, the **Playwright MCP server**, and the **planner / generator / healer** agents makes automated testing accessible from day one. The old "no time to write tests" excuse no longer holds — a few well-defined prompts deliver tested, validated, pipeline-integrated software.

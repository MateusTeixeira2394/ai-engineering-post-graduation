# Using AI to Consult Updated Documentation with Context7

> A beginner-friendly summary on why up-to-date docs matter and how the **Context7** MCP server solves the "outdated knowledge" problem.

---

## Why consult updated documentation?

LLMs like Claude or GPT are trained up to a **cutoff date**. After that, they stop learning unless you feed them fresh information. This becomes a real problem because:

- **APIs, libraries, and frameworks change versions** frequently.
- The model keeps suggesting **old, broken, or incompatible code**.
- You waste time debugging errors caused by **obsolete methods** (a common source of hallucinations).

Giving the model current documentation makes its answers **accurate, reliable, and safe to ship**.

---

## What is Context7?

**Context7** is an [MCP (Model Context Protocol) server](https://github.com/upstash/context7) that provides **up-to-date documentation, pulled directly from the source**, into your AI's context.

How it works:

- It **indexes the full documentation** of real projects (Next.js, Better Auth, Node.js, Prisma, and many more).
- At the moment you run a prompt, it **fetches only the most relevant snippets** and injects them automatically into the context the AI processes.
- The model then generates code and answers based on the **current version** of the tool.

### With vs. without Context7

| Without Context7 | With Context7 |
|---|---|
| You paste huge doc blocks manually | The server selects precise, small snippets |
| More tokens = higher cost | Lighter prompts, lower cost |
| Frequent retries and errors | Fewer errors, less rework |
| Re-explain setup every time | Docs fetched on demand |

---

## How to install it

1. **Create an API Key** in the Context7 dashboard.
2. **Add it to your `mcp.json`** configuration file. A typical entry looks like:

   ```json
   {
     "mcpServers": {
       "context7": {
         "command": "npx",
         "args": ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"]
       }
     }
   }
   ```

3. **Enable the tools** in your agent, mainly:
   - `resolve-library-id` → finds the correct library in the index.
   - `get-library-docs` (a.k.a. query-docs) → retrieves the relevant documentation.
4. **Run your prompt** directly in VS Code (or your MCP-compatible editor).

> Check the [official repository](https://github.com/upstash/context7) for the latest install instructions and supported clients.

---

## Best usage approach

To get the most out of Context7, structure your prompt clearly:

- **Set the role** — e.g., "You are an experienced fullstack developer."
- **Require Context7 explicitly** — tell the agent it *must* consult the docs before writing code.
- **Describe the task step by step** — what the app should contain, feature by feature.
- **Specify the target** — folder, framework, database, etc.

### Practical example

The demo built a **fullstack app** from a single prompt:

- **Next.js** as the framework, scaffolded with `npm`.
- **Better Auth** for GitHub authentication.
- **SQLite** for local data persistence (initialized and migrated automatically).
- Login flow configured and the app running on **port 3000**.

The agent used Context7 to look up integration examples for auth, database, and Next.js config — completing the task **without manual corrections**.

---

## Key benefits

- **Accuracy** — code always aligned with the current version of the tool.
- **Lower cost** — smaller prompts, fewer tokens, fewer retries.
- **Safety** — drastically reduces errors from obsolete methods.
- **Productivity** — build a working app from scratch with a single prompt.

---

## Final thoughts

Context7 keeps your LLM **aligned with the current state of the tools it uses**, cutting down on hallucinations and outdated suggestions. It makes AI-assisted development more **reliable, efficient, and powerful**.

If you're not using an MCP server like Context7 yet, this is a great time to start.

**Reference:** https://github.com/upstash/context7

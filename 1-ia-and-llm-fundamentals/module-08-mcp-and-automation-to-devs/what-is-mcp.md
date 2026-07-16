# What is MCP (Model Context Protocol)?

## What is it?

MCP is an **open-source protocol** announced by Anthropic in November 2024 to
connect AI assistants with external data sources. Its core idea is simple: you
plug ready-made **MCP servers** into a compatible client (such as VS Code), and
the AI starts using those integrations automatically — no extra coding required.

This lets an AI move from just *responding* to actually *acting* on real data.
For example, you could ask the AI to fetch a summary of the changes requested in
a pull request, suggest fixes, apply the adjustments, write tests, and commit
everything — or send an email directly through the Gmail API.

## How it works (three main components)

An MCP server exposes three fundamental building blocks, all described by
standardized schemas:

1. **Tools** — actions the AI can execute (e.g. "list talks", "create file",
   "run SQL query").
2. **Resources** — data used as context (e.g. file contents, logs, database
   schemas).
3. **Prompts** — templates and structures that help the AI formulate proper
   commands to use those tools.

When interpreting the user's request, the AI picks the tool that best fits based
on its **name, description, and expected parameters** — much like a human
developer understanding a problem and choosing the right function.

### How LLMs choose tools

LLMs don't rely on hard-coded `if/else` logic to decide which tool to use.
Instead, they learn to select the best option based on the **similarity between
the prompt and the tool's description**. Because of this:

- Tools with **clear names** (e.g. `readFile`) and objective descriptions are
  prioritized.
- The AI tends to prefer **non-destructive actions** (read, list) before writing
  or deleting.
- Tools with **well-defined parameter schemas** are favored.

More advanced models can chain calls: use a tool, analyze the result, then call
another tool based on that response.

### JSON Schema and validation

Each tool defines a **JSON Schema** for its input parameters. The LLM must
generate valid JSON for the call to succeed; if the schema isn't satisfied, the
execution fails and the model can retry. This provides strong control and
predictability — essential for production environments.

## Benefits

- **Reduced hallucination** — the AI accesses real data instead of inventing it.
- **Extensibility** — just install new MCP servers to add functionality.
- **Modularity** — combine multiple data sources in a single interaction.

## Use cases

Real-world MCP servers shown in practice include:

- **GitHub MCP** — list PRs, review code, open a PR.
- **Playwright MCP** — create tests and navigate websites.
- **Grafana MCP** — fetch monitoring data.
- **Resend email MCP** — generate and send emails straight from the editor.

These servers are plugged in via configuration files (`mcp.json`) in VS Code or
another compatible editor — you point to the server, provide credentials, and
the AI is ready to use the integration in your workflow.

## Examples

- Ask the AI which talks Eric gave in 2024, summarize the most recent one, and
  email it — combining multiple MCP sources in one interaction.
- **Personal MCP server:** the instructor built a server exposing an API with
  information about his talks, posts, and videos. To do it, he:
  - Structured the API.
  - Generated an automatic SDK via GraphQL.
  - Created automated tests with the Node.js Test Runner.
  - Published the package on npm.

  Anyone can then install this integration and query it directly from the AI in
  their editor.

## Conclusion

MCP represents a leap in applied AI: moving from text to concrete action. The AI
no longer just answers — it acts on real data following clear, safe standards.
This kind of integration should become increasingly common, especially in
corporate environments where security, auditability, and productivity go hand in
hand. MCP is the **"USB" of tools for the LLM era**: plug and play with real
power.

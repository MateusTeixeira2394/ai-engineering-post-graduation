# Module 2 — Intro to LangGraph

A deliberately small LangGraph app. One endpoint, three nodes, one rule:

> **Ask in UPPERCASE and the answer comes back in uppercase. Ask in lowercase
> and the answer comes back in lowercase.**

The casing trick is not the point — it is the smallest excuse to build a graph
that has real state, a real branch, and a real LLM call, so that every LangGraph
concept shows up exactly once and in a place you can point at.

## Quick start

```bash
cp .env.example .env     # then paste your Open Router key
npm install
npm start                # http://localhost:3000
```

```bash
# → uppercase branch
curl -s -X POST localhost:3000/chat \
  -H 'content-type: application/json' \
  -d '{"message":"WHAT IS LANGGRAPH IN ONE SENTENCE?"}'

{"rule":"uppercase","answer":"LANGGRAPH IS A FRAMEWORK FOR BUILDING STATEFUL, MULTI-STEP LLM APPLICATIONS AS DIRECTED GRAPHS.","model":"openai/gpt-5.4-mini"}
```

```bash
# → lowercase branch
curl -s -X POST localhost:3000/chat \
  -H 'content-type: application/json' \
  -d '{"message":"what is langgraph in one sentence?"}'

{"rule":"lowercase","answer":"langgraph is a framework for building llm applications as stateful graphs, where nodes do work and edges control the flow.","model":"openai/gpt-5.4-mini"}
```

The server logs which node ran, so you can watch the graph walk itself:

```
[node: detectRule] { message: 'WHAT IS LANGGRAPH...', rule: 'uppercase' }
[node: uppercase]  { model: 'openai/gpt-5.4-mini' }
```

## The graph

```
                  START
                    │
               detectRule              node 1 — pure logic, no LLM call
                    │
              (routeByRule)            conditional edge — picks a branch
               ╱          ╲
        uppercase        lowercase     nodes 2 & 3 — one LLM call each
               ╲          ╱
                   END
```

## The five concepts, and where each one lives

Read the files in this order. Each one carries a comment block explaining the
concept it introduces.

| # | Concept | File | What to notice |
|---|---------|------|----------------|
| 1 | **State** | `src/graph/state.ts` | One object, four fields, each written by exactly one place. |
| 2 | **Node** | `src/graph/detect-rule.node.ts` | A node is just a function `(state) => partialUpdate`. Nothing to extend. |
| 3 | **Conditional edge** | `src/graph/router.ts` | A router reads state and returns the *name* of the next node. |
| 4 | **The graph** | `src/graph/chat.graph.ts` | Nodes + edges + `.compile()`. The only file that knows the whole shape. |
| 5 | **Invoke** | `src/routes/chat.route.ts` | The entire graph collapses into one `await chatGraph.invoke({ message })`. |

### 1. State — the graph's memory for one run

```ts
export const ChatState = new StateSchema({
    message: z.string(),                        // input
    rule: casingRule.default('lowercase'),      // written by detectRule
    answer: z.string().default(''),              // written by a casing node
    model: z.string().default('')                // written by a casing node
});
```

A node **never mutates the state**. It returns a partial update — an object with
only the fields it wants to change — and LangGraph merges it in before moving on.
`detectRule` returns `{ rule }` and nothing else; `message` just passes through.

Fields with `.default()` are optional when you call `invoke()`, which is why
`invoke({ message })` is enough to start a run.

> `StateSchema` is the current way to declare state (LangGraph v1.1+). Older
> tutorials use `Annotation.Root({ ... })` — still supported, but `StateSchema`
> is what the docs recommend now, and it lets you use plain Zod.

### 2. Node — a function, not a class

```ts
export const detectRuleNode: GraphNode<typeof ChatState> = (state) => {
    return { rule: detect(state.message) };
};
```

That is the whole contract: take state, return an update. This node does not
even call the LLM — **a node can be plain logic**, and keeping the decision
deterministic makes the graph cheap to run and trivial to reason about.

The two casing nodes (`uppercase.node.ts`, `lowercase.node.ts`) are `async` and
do call the LLM. Same signature, same contract.

### 3. Conditional edge — the branch

A normal edge is static: *after A, always go to B.* A conditional edge is
decided at runtime by a **router**: a function that reads state and returns the
name of the node to run next (or `END`).

```ts
export const routeByRule: ConditionalEdgeRouter<{
    InputSchema: typeof ChatState;
    Nodes: 'uppercase' | 'lowercase';
}> = (state) => state.rule;
```

Notice the split of responsibility: the **node** decides *what the rule is*, the
**router** decides *where that leads*. A router only chooses — it never returns
a state update. The node names were chosen to match the `rule` values, which is
why the router is one line.

### 4. The graph — wiring, then `.compile()`

```ts
export const chatGraph = new StateGraph(ChatState)
    .addNode('detectRule', detectRuleNode)
    .addNode('uppercase', uppercaseNode)
    .addNode('lowercase', lowercaseNode)
    .addEdge(START, 'detectRule')
    .addConditionalEdges('detectRule', routeByRule, ['uppercase', 'lowercase'])
    .addEdge('uppercase', END)
    .addEdge('lowercase', END)
    .compile();
```

`START` and `END` are LangGraph's two built-in virtual nodes: where a run begins
and where it finishes. The third argument to `addConditionalEdges` lists the
reachable nodes — optional, but it makes the branch explicit.

`.compile()` validates the wiring **once, at startup**. Point an edge at a node
that does not exist and you find out when the server boots, not on the first
request.

### 5. Invoke — the graph as one call

```ts
const result = await chatGraph.invoke({ message });
// result.rule, result.answer, result.model
```

You hand `invoke` the input state and get the **final** state back, after every
node it visited has merged its update in.

Look at what the HTTP layer does *not* know: which branch ran, how many nodes
exist, or that an LLM was involved at all. Add a fourth node tomorrow and
`chat.route.ts` does not change. That decoupling is most of what a graph buys you.

## Design decisions worth knowing about

**How the rule is detected.** `detectRule` asks whether the message is written
entirely in capitals:

```ts
const hasLetters = /\p{L}/u.test(message);
return hasLetters && message === message.toUpperCase() ? 'uppercase' : 'lowercase';
```

`\p{L}` is the Unicode "any letter" class, so accents work — `"O QUE É
LANGGRAPH?"` is uppercase, `"o que é langgraph?"` is not. Anything not entirely
uppercase, **mixed case included** (`"What is LangGraph?"`), falls through to
`lowercase`.

**Ask the model, then enforce it in code.** Each casing node does both:

1. the system prompt *asks* for uppercase — a soft request;
2. `.toUpperCase()` *guarantees* it — models drift, code does not.

This is the habit worth copying beyond this toy: treat model output as a
suggestion your code is still responsible for.

**Open Router through the OpenAI client.** Open Router speaks the OpenAI
protocol, so `ChatOpenAI` reaches it by changing one field:

```ts
new ChatOpenAI({
    model: 'openai/gpt-5.4-mini',
    apiKey: config.openRouterApiKey,
    configuration: { baseURL: 'https://openrouter.ai/api/v1' }
});
```

A LangChain chat model is just an object with `.invoke()`, which is what makes
it drop straight into a node. Swap in `ChatAnthropic` or a local Ollama model
and no node changes.

**Flatter than module 1.** No models, DTOs, or controllers layer, and no chat
history. The lesson here is LangGraph, not architecture — `chat.route.ts` is
five real lines so that `src/graph/` is where your attention goes.

## Files

```
src/
  index.ts                  entry point
  config.ts                 env + model + Open Router base URL
  server.ts                 Fastify instance
  routes/
    index.ts                route registration + /health
    chat.route.ts           POST /chat — calls graph.invoke()
  schemas/
    chat.schema.ts          request/response JSON Schema
  graph/
    state.ts                ← concept 1: state
    detect-rule.node.ts     ← concept 2: node
    uppercase.node.ts       node 2
    lowercase.node.ts       node 3
    router.ts               ← concept 3: conditional edge
    chat.graph.ts           ← concept 4: the graph
  services/
    model.ts                ChatOpenAI → Open Router, plus ask()
```

## API

### `POST /chat`

```jsonc
// request
{ "message": "string, 1–2000 chars" }

// 200
{ "rule": "uppercase" | "lowercase", "answer": "string", "model": "string" }

// 400 — body failed schema validation (Fastify handles this)
// 502 — the model could not be reached
{ "message": "string" }
```

### `GET /health`

```json
{ "status": "ok" }
```

## Things to try next

Each of these is a small change that teaches one more LangGraph idea:

- **Add a third rule.** A `titlecase` node plus one more value in `casingRule`.
  Notice you touch `state.ts` and `chat.graph.ts` — and nothing else.
- **Make the branch expensive.** Have `detectRule` ask the LLM to classify intent
  instead of reading the casing. The graph shape does not change at all.
- **Add a loop.** Point a node's edge back at an earlier node and use a counter
  field in state to stop. This is where graphs beat plain chains.
- **Add memory.** Pass a `MemorySaver` checkpointer to `.compile()` and a
  `thread_id` to `invoke()`, and the graph remembers previous turns.
- **Draw it.** `await chatGraph.getGraphAsync({})` gives you a diagram of the
  wiring you declared.

## Commands

```bash
npm start        # watch mode, loads .env, inspector on
npm run typecheck
```

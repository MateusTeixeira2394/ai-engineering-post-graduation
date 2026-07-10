# JSON Prompting Guide

> Summary of [mpgone.com/json-prompt-guide](https://mpgone.com/json-prompt-guide/)

## What It Is

JSON prompting structures AI instructions as **key-value fields** instead of paragraph prose. It acts as an explicit contract — task, constraints, output format — producing consistent, repeatable results across ChatGPT, Claude, Gemini, and other models.

## Core Structure

Three foundational fields:

```json
{
  "task": "What you want done",
  "constraints": ["Hard rule 1", "Hard rule 2"],
  "output": { "format": "markdown", "length": "200 words" }
}
```

Always prepend a wrapper instruction so the model **executes** the JSON rather than analyzing it:

> "Follow the instructions in this JSON prompt exactly."

## Fields by Priority

| Field | Priority | Use for |
|-------|----------|---------|
| `task` | Required | The action to perform |
| `constraints` | High | Hard rules (one per array item) |
| `output` | High | Format, length, structure |
| `example_output` | High when style matters | Show the target style |
| `context` / `audience` | Medium | Grounding and tone |
| `role` | Low | Persona framing |

## When to Use

- Repeatable tasks with strict format requirements
- Anything where constraint adherence matters
- Workflows where you'd otherwise burn retries fixing output shape

## When to Avoid

- One-off factual questions
- Exploratory or creative brainstorming (where surprise is wanted)
- Iterative, conversational editing

## Common Pitfalls

- Over-engineering with too many fields
- Writing constraints as prose instead of discrete array items
- Omitting the wrapper instruction line
- Skipping `example_output` when style is important

## Takeaway

The slight token overhead is offset by saving whole retry rounds — JSON prompting trades verbosity for reliability on structured, repeatable work.

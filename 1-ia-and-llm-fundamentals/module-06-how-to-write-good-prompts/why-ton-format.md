# Why TOON (Token-Oriented Object Notation)

> Source: [toon-format/toon](https://github.com/toon-format/toon)

## What it is

A compact, human-readable, **lossless JSON alternative** optimized for LLM input. It mixes YAML-style indentation with CSV-like tabular rows to cut token usage while keeping data structure explicit.

## The problem it solves

LLM tokens cost money, and JSON is verbose (repeated keys, braces, quotes). TOON encodes the same data with fewer tokens **and** gives the model explicit structural hints (array lengths, field headers) that improve parsing reliability.

## Format at a glance

- Indentation-based nesting (like YAML)
- Array length declared in brackets: `[N]`
- Field headers in braces: `{field1,field2}`
- Rows as comma-separated values
- Minimal quoting

```
hikes[3]{id,name,distanceKm,elevationGain,companion,wasSunny}:
  1,Blue Lake Trail,7.5,320,ana,true
  2,Ridge Overlook,9.2,540,luis,false
  3,Wildflower Loop,5.1,180,sam,true
```

## Benefits over JSON

- **~40% fewer tokens** on typical data
- **Lossless** round-trip conversion with JSON
- **Explicit metadata** (field counts, array lengths) helps the model
- Implementations in TypeScript, Python, Go, Rust, and .NET

## Benchmarks

Across 209 retrieval questions on four models:

| Metric | TOON | JSON |
|---|---|---|
| Accuracy | 76.4% | 75.0% |
| Accuracy per 1K tokens | 27.7 | 16.4 |

## When to use it

- Uniform arrays of objects with primitive values (best case — full tabular layout)
- Prompts where token cost matters
- Mixed-structure datasets needing token reduction

## When *not* to use it

- Pure flat tables → use CSV
- Deeply nested, non-uniform data → JSON may be more efficient
- Semi-uniform data (40–60% tabular eligibility) → savings shrink
- Latency-critical paths → benchmark first

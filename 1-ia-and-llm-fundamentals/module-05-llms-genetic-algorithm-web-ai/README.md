# Module 05 — LLMs, Genetic Algorithms & Web AI

This module covers three topics: how Large Language Models turn text into
predictions, how two nature-inspired optimization families (genetic algorithms
and reinforcement learning) differ, and how a model can run entirely inside the
browser with no backend.

---

## 1. How LLMs Work

A step-by-step walkthrough of the LLM inference pipeline, from raw text to the
next generated token. It follows each stage in order — **tokenization** and token
IDs, **embeddings**, **positional encoding**, the **Transformer** stack
(multi-head self-attention with Query/Key/Value, feed-forward networks, residual
connections, and layer normalization), and the output path of **linear
projection → logits → softmax → temperature → sampling** (greedy, top-k, top-p).
It closes on **autoregressive generation**, where each predicted token is fed back
in to produce the next, plus a summary table of every component's purpose.

📄 [`how-the-llms-work.md`](how-the-llms-work.md)

---

## 2. Genetic Algorithms vs. Reinforcement Learning

A comparison of two nature-inspired optimization approaches. **Genetic Algorithms**
evolve a *population* of candidate solutions across generations using a fitness
function, selection, crossover, and mutation. **Reinforcement Learning** instead
has a single *agent* learn through trial and error by interacting with an
environment, guided by states, actions, rewards, and a policy. The document
contrasts them side by side (evolution vs. experience), works through a maze
example for each, weighs their strengths and weaknesses, and explains why modern
LLMs are trained with supervised learning and RL — not genetic algorithms —
though GAs still appear in hyperparameter search and neural architecture search.

📄 [`genetic-vs-reinforcement-algorithms.md`](genetic-vs-reinforcement-algorithms.md)

---

## 3. Web AI — Question Answering in the Browser

A hands-on demo of running a machine-learning model **entirely client-side**, with
no server, no API keys, and no data leaving the device. A single `index.html`
loads `Xenova/distilbert-base-cased-distilled-squad` via **Transformers.js** and
performs extractive question answering locally, powered by WebAssembly and
WebGPU/WebGL. The document explains what Web AI is, its trade-offs (privacy,
offline capability, zero inference cost vs. a one-time model download and a model
size limit), walks through the code, and shows how to serve and try the app.

📄 [`web-ai-llm/README.md`](web-ai-llm/README.md)

---

## Topic Documents

| # | Topic | Path |
|---|-------|------|
| 1 | How LLMs Work | [`how-the-llms-work.md`](how-the-llms-work.md) |
| 2 | Genetic Algorithms vs. Reinforcement Learning | [`genetic-vs-reinforcement-algorithms.md`](genetic-vs-reinforcement-algorithms.md) |
| 3 | Web AI — QA in the Browser | [`web-ai-llm/README.md`](web-ai-llm/README.md) |

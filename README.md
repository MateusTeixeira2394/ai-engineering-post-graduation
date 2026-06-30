# AI Engineering Post-Graduation

Personal study repository for my post-graduation in **Applied AI Engineering**
(*Engenharia de Software em IA Aplicada*).

## Why this repo exists

This repository is my learning journal for the course. As I move through each
module, I keep the code, experiments, notes, and projects here — both as a
reference I can come back to and as a public portfolio of what I'm building
along the way.

The structure follows the official course syllabus. Each numbered module below
gets its own top-level folder as I reach it, with the
hands-on work and a per-module README. The course is heavily project-oriented
and built mostly with **JavaScript/TypeScript** (Node.js, TensorFlow.js,
LangChain/LangGraph), so most code here is in that stack.

## Modules

### 1. Foundations of AI & LLMs for Programmers
- History and context of AI; timeline from early ideas to ML, DL, LLMs.
- How LLMs work: transformers, embeddings, attention.
- ML vs DL vs AI, tensors, and how neural networks learn.
- Building and training your first neural network from scratch in JavaScript
  (data → training → validation → inference).
- Practical Web ML: video in the browser, ML in games, intro to Deep Learning.
- Prompt engineering basics; AI dev tools (Cursor, Windsurf vs VSCode, `.cursor`
  rules, Vibe Coding); MCPs and automation; intro to RAG, embeddings and
  semantic search (first RAG with JavaScript + Postgres); open-source vs
  proprietary models (OpenRouter, Ollama); intro to AI agents.

### 2. Generative AI APIs & Prompt Engineering
- The "AI as a service" market and where the real opportunities are.
- Main providers: OpenAI, Anthropic, Hugging Face, Google Gemini.
- Advanced prompting: prompt chaining, templates, reducing hallucinations.
- Consistency and cost-efficiency: cost-aware API calls, caching, context reuse,
  token reduction.
- Advanced RAG with LangChain/Pipes; error handling and retries; logging,
  observability and debugging of AI apps.
- Integrating an LLM into an existing back-end.
- Multimodal models (text, image, audio, video): Vision, Whisper, Gemini
  multimodal; smart OCR, media analysis, multimodal bots.

### 3. MCP – Model Context Protocol
- What MCP is and why it's gaining traction; standardizing LLM ↔ services.
- MCP vs traditional tools/plugins.
- Building and consuming MCPs in JavaScript/TypeScript.
- Turning a company into an "MCP": exposing internal services (CRM, billing,
  support) via an AI-ready layer.
- Security and governance: auth, service tokens, rate limiting, WAF.
- Real-world cases and hands-on: an MCP server from zero to production.

### 4. Building Autonomous Agents
- Agent architecture: the agent loop (perception → reasoning → action →
  feedback); planner, executor, memory store, toolbox; agent types.
- Reasoning/execution patterns: ReAct, Plan-and-Execute, Reflection
  (with LangChain/LangGraph).
- Function calling & tool use; JSON schemas; connecting agents to APIs, DBs, MCPs.
- Memory & reflection (short, long, episodic, contextual).
- Context management (pruning, stitching, shared contexts).
- LangGraph and complex multi-agent workflows.
- Observability, guardrails, human-in-the-loop, autonomy limits.
- Multi-agent systems: Supervisor, Hierarchical, Group Chat, Delegation,
  Consensus (CrewAI, AutoGPT, etc.).

### 5. AI Tools for UX & UI
- AI-driven UX/UI across research, ideation, prototyping, development and test.
- Text-to-UI: generating wireframes and mockups; Figma → front-end with
  Firebase Studio.
- Coding agents and CLI in the front-end workflow (Gemini CLI).
- Intelligent UI automation and E2E testing via the app's MCP.
- AI logic on client and server (Firebase AI Logic, semantic search, chatbots,
  real-time personalization).

### 6. AI Tools for DevOps
- GenAI foundations for infrastructure (LLM APIs, agent frameworks, RAG for
  technical docs, prompting for infra).
- IaC Copilot: natural language → Terraform/Pulumi/Helm, policy-as-code (OPA,
  Sentinel), PR-first workflow, drift detection.
- Agents for Kubernetes: manifests, HPA/VPA, autoscaling, rollouts, GitOps
  (Argo CD, Flux).
- Assisted troubleshooting (ReAct), AIOps & observability (PromQL/LogQL,
  Grafana, anomaly detection).
- ChatOps with human approval & governance; AI-assisted security & compliance;
  CI/CD copilot; FinOps & cost optimization; RAG of runbooks & post-mortems;
  safe auto-remediation with guardrails; integrator project.

### 7. AI Tools for Project Management
- Requirements copilot (NL → epics, user stories, acceptance criteria).
- Intelligent backlog prioritization (RICE, WSJF, MoSCoW).
- Assisted scheduling, capacity and allocation; estimates and forecasting
  (Monte Carlo); project AIOps for risks.
- Supercharged meetings (notes, action items, follow-ups); automated status
  reports & executive summaries; governance, compliance & quality.
- Automation in Jira/Asana/Trello/Notion/Slack; portfolio & OKRs with AI.

### 8. Systems Architecture with AI
- AI-first architecture fundamentals; five design patterns (Prompting,
  Responsible AI, UX, AI-Ops, Optimization); AI vs deterministic decision
  framework; latency/accuracy/cost trade-offs.
- Single-agent architectures (Reactive, Memory-Enhanced, Tool-Using, ReAct,
  Self-Reflection).
- Multi-agent architectures (Sequential, Parallel, Supervisor, Hierarchical,
  Group Chat, Handoff).
- AI-specific design patterns: RAG variants (Basic, Hybrid, Multi-Index,
  Agentic), model/intent routing, semantic/prompt caching, HITL.
- Enterprise architecture: API Gateway → orchestration → shared services →
  observability; model tiering and cost control.

### 9. Data Processing & Model Fine-Tuning
- When to fine-tune (decision framework).
- Dataset preparation (cleaning, balancing, JSONL formatting).
- Fine-tuning via OpenAI API (upload, train, hyperparameters).
- LoRA and PEFT (parameter-efficient fine-tuning); full fine-tune vs LoRA.
- Evaluating fine-tuned models (qualitative/quantitative metrics, A/B tests,
  overfitting).
- Final project: a custom model for a specific domain.

### 10. AI Security & Governance
- What AI governance is; interpretability and explainability.
- Bias and responsibility in models; human and ethical aspects.
- Risk management; data security; legal and regulatory aspects.
- Financial costs of AI.

### 11. Capstone Project – Micro-SaaS
- Ideation and architecture of a Micro-SaaS (problem, value proposition, stack).
- Core intelligence with RAG + agents and a vector database (CLI prototype).
- Orchestration, back-end APIs, MCP bridge to the UI, multi-agent orchestration
  with ADK.
- Front-end (Angular) integration, MCP validation, CI/CD and deployment.
- Final presentation and technical defense.

### 12. Career & Interviews for Applied AI Engineers
- LinkedIn optimization, strategic networking, personal branding.
- Professional GitHub portfolio; expectations by level (Junior → Principal).
- HR and technical interview prep (STAR, live coding, AI system design).
- Explaining technical decisions; AI-specific questions (RAG vs fine-tuning,
  when to use agents, cost optimization, failure handling).
- Salary negotiation, raises/promotions, and differentiation techniques.

## Repository structure

```
ai-engineering-post-graduation/
├── 1-ia-and-llm-fundamentals/    # Module 1 — code & projects
│   └── module-02-creating-my-first-neural-network/
└── README.md
```

Additional module folders will be added as the course progresses.

## Tech stack

JavaScript / TypeScript · Node.js · TensorFlow.js · LangChain / LangGraph ·
Vector databases & Postgres · OpenAI / Anthropic / Gemini APIs · MCP

---

> Study repository — content reflects my progress through the program and is
> updated as I complete each module.
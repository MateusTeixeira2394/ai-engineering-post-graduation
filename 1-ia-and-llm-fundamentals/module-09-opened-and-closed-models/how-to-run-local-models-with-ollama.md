# How to Run Local Models with Ollama

This chapter shares a hands-on look at **Ollama**, an accessible and powerful tool for downloading, managing, and running language models locally — no external servers required. It covers how the tool works, its possibilities, its challenges, and practical usage aimed at developers interested in AI.

## What is Ollama?

Ollama is an application for macOS, Windows, and Linux with a simple interface and an HTTP API underneath, enabling integration with any app. Built on top of Meta's ecosystem and the LLaMA models, it gained traction from July 2023. Its main strength is ease of use: simple commands like `ollama pull` and `ollama serve` let you download and run models locally.

It offers a broad model catalog, including general-purpose, code, and multimodal models (combined text and image input).

## Benefits

- **Local and offline execution** — ideal for automation, scripts, testing, and study.
- **Free** — no per-token cost.
- **Broad model support** — LLaMA, GPT OSS, Gemma, and others.
- **Friendly interface, terminal-integrable** — works with `curl`, shell scripts, editors, and MCP servers.

## Limitations

Ollama is not meant for production. It runs one prompt at a time, is resource-heavy on the local machine, and lacks high concurrency. For scalability and low-latency needs, tools like **vLLM** are more appropriate.

## Parameters, Context, and Quantization

Three concepts explain model behavior:

- **Parameters** — the model's weights (what it learned). More parameters generally mean greater capability but higher compute demands (e.g., 20B, 120B).
- **Context size** — how many tokens can be processed at once (e.g., 32k, 128k, up to 1M).
- **Quantization** — reducing model size by changing the numeric representation of weights. Quantized models use less memory and run faster, with a slight quality trade-off.

Suffixes like `Q4F32_1` indicate the quantization scheme (e.g., 4-bit weights, 32-bit activations), making it possible to run 20B models on just 16GB of RAM.

## Experimenting with Curl and the HTTP API

Scripting against Ollama is straightforward. The HTTP API accepts `curl` requests that send prompts and return JSON responses, enabling integration with any system and local automation. It also exposes **OpenAI-compatible endpoints**, easing the migration of existing applications to Ollama.

## Censored vs. Uncensored Models

Some models restrict responses on sensitive topics; others impose no filters. Uncensored models can be useful for research or study but require responsibility, especially in general-purpose applications.

## Integration with Jan AI

**Jan AI** is an open-source desktop app for using local models with ChatGPT-like features: assistants, history, vector database, file system access, and MCP integration. It supports models from multiple sources (OpenRouter, Hugging Face, Ollama, etc.) and lets you configure MCP locally for file access, web browsing, and personal projects.

## Jan AI in the Code Editor

Jan AI can be integrated into a code editor to use local models for code generation, refactoring, and review — just add the Ollama provider and pick a model. Even small models can help day to day at no cost.

## Final Thoughts

Running models locally with Ollama is an excellent option for developers who want to explore AI economically and independently. Despite its production limitations, it's a great experience for prototyping, local automation, and study.

Mastering tools like Ollama and Jan AI lets you strengthen your AI applications, cut costs, and gain freedom to experiment. The key is understanding hardware limits, choosing the right model for your scenario, and applying good prompt-engineering practices.

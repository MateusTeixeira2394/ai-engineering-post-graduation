import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { promptsFiles, type AnswerPrompt } from "./prompts/promptConfig.ts";

// Anchor relative paths to the module root so they don't depend on the caller's cwd.
const MODULE_ROOT = resolve(import.meta.dirname, "..");

export interface TextSplitterConfig {
    chunkSize: number;
    chunkOverlap: number;
}

export const CONFIG = Object.freeze({
    answerPrompt: JSON.parse(
        readFileSync(promptsFiles.answerPrompt, 'utf-8')
    ) as AnswerPrompt,
    templateText: readFileSync(promptsFiles.template, 'utf-8'),
    neo4j: {
        url: process.env.NEO4J_URI!,
        username: process.env.NEO4J_USER!,
        password: process.env.NEO4J_PASSWORD!,
        indexName: "tensors_index",
        searchType: "vector" as const,
        textNodeProperties: ["text"],
        nodeLabel: "Chunk",
    },
    openRouter: {
        llmModel: process.env.LLM_MODEL,
        url: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        temperature: - 0.3,
        maxRetries: 2,
        defaultHeaders: {
            "HTTP-Referer": process.env.OPENROUTER_SITE_URL,
            "X-Title": process.env.OPENROUTER_SITE_NAME,
        }
    },
    pdf: {
        path: resolve(
            MODULE_ROOT,
            process.env.PDF_PATH || "src/assets/pdfs/sample.pdf"
        ),
    },
    textSplitter: {
        chunkSize: 1000,
        chunkOverlap: 200,
    } as TextSplitterConfig,
    embedding: {
        model: process.env.EMBEDDING_MODEL,
        pretrainedOptions: {
            dtype: "fp32" as const,
        },
    },
    similarity: {
        topK: 3,
        threshold: 0.7,
    }
});
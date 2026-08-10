import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./tools/pdfProcessor.ts";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import type { PretrainedOptions } from "@huggingface/transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { VectorDatabase } from "./tools/vectorDatabase.ts";
import { AI } from "./tools/ai.ts";
import * as readline from "node:readline/promises";

// `--no-seed` reuses whatever is already stored in Neo4j: no PDF parsing, no
// wipe, no re-embedding.
const shouldSeed = !process.argv.includes("--no-seed");

// Typing any of these at the prompt ends the session.
const EXIT_COMMANDS = ["exit", "quit", "q"];

let vectorStore: Neo4jVectorStore | undefined;

try {
    console.log("Starting the Embedding system with Neo4j...");

    // Load the embedding model
    const embeddings = new HuggingFaceTransformersEmbeddings({
        model: CONFIG.embedding.model,
        // LangChain types this as PretrainedOptions but forwards it straight to
        // pipeline(), whose options also cover the model-specific `dtype`.
        pretrainedOptions: CONFIG.embedding.pretrainedOptions as PretrainedOptions,
    });

    // Load the vector store
    vectorStore = await Neo4jVectorStore.fromExistingGraph(embeddings, CONFIG.neo4j);

    // Load the vector database
    const vectorDatabase = new VectorDatabase(vectorStore);

    // Seed the database if needed
    if (shouldSeed) {
        const documentProcessor = new DocumentProcessor(
            CONFIG.pdf.path,
            CONFIG.textSplitter
        );

        const documents = await documentProcessor.loadAndSplitPDF();

        await vectorDatabase.clearAll(CONFIG.neo4j.nodeLabel);

        await vectorDatabase.addDocuments(documents);
    } else {
        console.log("🛢 Skipping seeding (--no-seed): reusing the existing Neo4j data.");
    }

    // After the database is seeded, resume the application

    const ai = new AI(vectorDatabase);

    // Ask questions until the user leaves. The async iteration also ends on
    // Ctrl+D / Ctrl+C, which closes the readline interface.
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log(
        `\n💬 Ask anything about the document. Type "${EXIT_COMMANDS.join('", "')}" or press Ctrl+C to leave.`
    );

    rl.setPrompt("\nQuestion: ");

    // stdin can end while an answer is still in flight (Ctrl+D, or a piped
    // script), and prompting a closed interface throws ERR_USE_AFTER_CLOSE.
    let isClosed = false;
    rl.on("close", () => { isClosed = true; });

    const prompt = () => { if (!isClosed) rl.prompt(); };

    prompt();

    for await (const line of rl) {
        const question = line.trim();

        if (question.length === 0) {
            prompt();
            continue;
        }

        if (EXIT_COMMANDS.includes(question.toLowerCase())) {
            break;
        }

        try {
            const answer = await ai.answerQuestion(question);

            console.log('\n================================');
            console.log(`\n💬 Question: ${question}`);
            console.log(`\n💡 Answer: ${answer}`);
        } catch (error) {
            // Keep the session alive: one bad question should not end the loop.
            console.error("Failed to answer the question:", error);
        }

        prompt();
    }

    rl.close();
    console.log("\n👋 Bye!");

} catch (error) {
    console.error("An error occurred:", error);
} finally {
    // Release the Neo4j driver so the process can exit.
    await vectorStore?.close();
}
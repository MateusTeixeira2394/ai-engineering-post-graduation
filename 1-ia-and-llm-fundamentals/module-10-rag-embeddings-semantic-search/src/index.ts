import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./tools/pdfProcessor.ts";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import type { PretrainedOptions } from "@huggingface/transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { VectorDatabase } from "./tools/vectorDatabase.ts";
import { AI } from "./tools/ai.ts";

// `--no-seed` reuses whatever is already stored in Neo4j: no PDF parsing, no
// wipe, no re-embedding.
const shouldSeed = !process.argv.includes("--no-seed");

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
    const vectorStore = await Neo4jVectorStore.fromExistingGraph(embeddings, CONFIG.neo4j);

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

    const question = "Why does Alice follow the White Rabbit down the rabbit hole?";

    const ai = new AI(vectorDatabase);
    const answer = await ai.answerQuestion(question);

    console.log(`\nQuestion: ${question}`);
    console.log(`\nAnswer: ${answer}`);

} catch (error) {
    console.error("An error occurred:", error);
}
import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./tools/pdfProcessor.ts";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import type { PretrainedOptions } from "@huggingface/transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { VectorDatabase } from "./tools/vectorDatabase.ts";

// `--no-seed` reuses whatever is already stored in Neo4j: no PDF parsing, no
// wipe, no re-embedding.
const shouldSeed = !process.argv.includes("--no-seed");

try {
    console.log("Starting the Embedding system with Neo4j...");

    const embeddings = new HuggingFaceTransformersEmbeddings({
        model: CONFIG.embedding.model,
        // LangChain types this as PretrainedOptions but forwards it straight to
        // pipeline(), whose options also cover the model-specific `dtype`.
        pretrainedOptions: CONFIG.embedding.pretrainedOptions as PretrainedOptions,
    });

    const vectorDatabase = new VectorDatabase(await Neo4jVectorStore.fromExistingGraph(embeddings, CONFIG.neo4j));

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

    const question = "Why the rabbit was late to the party?";

    const results = await vectorDatabase.searchSimilarDocuments(question, CONFIG.similarity.topK);

    results.forEach((doc, index) => {
        console.log(`\n📌 Result ${index + 1}:`);
        console.log(`Page Number: ${doc.metadata.pageNumber}`);
        console.log(`Chunk Position: ${doc.metadata.chunkPosition}`);
        console.log(`Content: ${doc.pageContent}`);
    });

} catch (error) {
    console.error("An error occurred:", error);
}
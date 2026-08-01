import { CONFIG } from "./config.ts";
import { DocumentProcessor } from "./tools/pdfProcessor.ts";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import type { PretrainedOptions } from "@huggingface/transformers";
import { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import { VectorDatabase } from "./tools/vectorDatabase.ts";

try {
    console.log("Starting the Embedding system with Neo4j...");
    const documentProcessor = new DocumentProcessor(
        CONFIG.pdf.path,
        CONFIG.textSplitter
    );

    const documents = await documentProcessor.loadAndSplitPDF();

    const embeddings = new HuggingFaceTransformersEmbeddings({
        model: CONFIG.embedding.model,
        // LangChain types this as PretrainedOptions but forwards it straight to
        // pipeline(), whose options also cover the model-specific `dtype`.
        pretrainedOptions: CONFIG.embedding.pretrainedOptions as PretrainedOptions,
    });

    const vectorDatabase = new VectorDatabase(await Neo4jVectorStore.fromExistingGraph(embeddings, CONFIG.neo4j));

    await vectorDatabase.clearAll(CONFIG.neo4j.nodeLabel);

    await vectorDatabase.addDocuments(documents);

} catch (error) {
    console.error("An error occurred:", error);
}
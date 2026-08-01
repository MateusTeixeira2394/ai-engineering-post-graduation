import type { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import type { DocumentInterface } from "@langchain/core/documents";
import type { Document } from "./pdfProcessor.ts";

/**
 * `fromExistingGraph` builds its own retrieval query, which rebuilds the text as
 * `'\n' + key + ': ' + value` for every entry in `textNodeProperties`. Strip that
 * prefix so the chunk text that reaches the prompt matches what was embedded.
 */
function stripTextNodePrefix(pageContent: string): string {
    return pageContent.replace(/^\ntext: /, "");
}

/**
 * Neo4j integers come back through `itemIntToString`, so numeric metadata can
 * arrive as strings. Coerce it back instead of casting, which would leave
 * `chunkPosition` as `"3"` for any caller that trusts the `Document` type.
 */
function toNumber(value: unknown): number {
    return typeof value === "number" ? value : Number(value);
}

function toDocument(result: DocumentInterface): Document {
    return {
        pageContent: stripTextNodePrefix(result.pageContent),
        metadata: {
            totalPages: toNumber(result.metadata.totalPages),
            pageNumber: toNumber(result.metadata.pageNumber),
            source: String(result.metadata.source ?? ""),
            chunkPosition: toNumber(result.metadata.chunkPosition),
        },
    };
}

export class VectorDatabase {

    private vectorStore: Neo4jVectorStore;

    constructor(vectorStore: Neo4jVectorStore) {
        this.vectorStore = vectorStore;
    }

    async clearAll(nodeLabel: string): Promise<void> {
        console.log(`🛢 Clearing all nodes with label "${nodeLabel}" from the Neo4j database...`);
        try {
            await this.vectorStore.query(`MATCH (n:${nodeLabel}) DETACH DELETE n`);
            console.log(`🛢 Successfully cleared all nodes with label "${nodeLabel}".`);
        } catch (error) {
            console.error(`🛢 Failed to clear nodes with label "${nodeLabel}":`, error);
        }
    }

    async addDocuments(documents: Document[]): Promise<void> {
        console.log(`🛢 Adding ${documents.length} documents to the Neo4j database...`);
        try {
            for (const [index, document] of documents.entries()) {
                await this.vectorStore.addDocuments([document]);
                console.log(`🛢 Added document ${index + 1}/${documents.length} to the Neo4j database.`);
            }
            console.log(`🛢 Successfully added all documents to the Neo4j database.`);
        } catch (error) {
            console.error(`🛢 Failed to add documents to the Neo4j database:`, error);
        }
    }

    async searchSimilarDocuments(query: string, topK: number): Promise<Document[]> {
        console.log(`🛢 Searching the ${topK} chunks most similar to: "${query}"...`);
        try {
            const results = await this.vectorStore.similaritySearch(query, topK);
            console.log(`🛢 Found ${results.length} similar chunks.`);
            return results.map(toDocument);
        } catch (error) {
            console.error(`🛢 Failed to search similar documents:`, error);
            return [];
        }
    }
}

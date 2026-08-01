import type { Neo4jVectorStore } from "@langchain/community/vectorstores/neo4j_vector";
import type { Document } from "./pdfProcessor.ts";

type Neo4jPropertyValue = string | number | boolean | string[] | number[] | boolean[];

function isPrimitive(value: unknown): value is string | number | boolean {
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

/**
 * Neo4j node properties can only hold primitives or homogeneous arrays of
 * primitives, but loaders/splitters produce nested metadata (`loc.lines.from`,
 * `pdf.info.*`). Flatten nested objects into dot-separated keys and serialize
 * whatever still doesn't fit so `SET c += row.metadata` never sees a Map.
 */
function flattenMetadata(
    metadata: Record<string, unknown>,
    prefix = ""
): Record<string, Neo4jPropertyValue> {
    const flattened: Record<string, Neo4jPropertyValue> = {};

    for (const [key, value] of Object.entries(metadata)) {
        const propertyName = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
            continue;
        }

        if (isPrimitive(value)) {
            flattened[propertyName] = value;
            continue;
        }

        if (value instanceof Date) {
            flattened[propertyName] = value.toISOString();
            continue;
        }

        if (Array.isArray(value)) {
            const isHomogeneousPrimitiveArray =
                value.length > 0 &&
                value.every((item) => isPrimitive(item) && typeof item === typeof value[0]);

            flattened[propertyName] = isHomogeneousPrimitiveArray
                ? (value as Neo4jPropertyValue)
                : JSON.stringify(value);
            continue;
        }

        if (typeof value === "object") {
            Object.assign(
                flattened,
                flattenMetadata(value as Record<string, unknown>, propertyName)
            );
            continue;
        }

        flattened[propertyName] = String(value);
    }

    return flattened;
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
                await this.vectorStore.addDocuments([{
                    ...document,
                    metadata: flattenMetadata(document.metadata ?? {}),
                }]);
                console.log(`🛢 Added document ${index + 1}/${documents.length} to the Neo4j database.`);
            }
            console.log(`🛢 Successfully added all documents to the Neo4j database.`);
        } catch (error) {
            console.error(`🛢 Failed to add documents to the Neo4j database:`, error);
        }
    }
}

import { ChatOpenAI, type ChatOpenAICallOptions } from "@langchain/openai";
import { CONFIG } from "../config.ts";
import { RunnableSequence } from "@langchain/core/runnables";
import type { VectorDatabase } from "./vectorDatabase.ts";

type ChainState = {
    question: string;
    context: string;
    topScore?: number;
    error?: string;
    answer?: string;
}

export class AI {

    // LLM instance
    private llm: ChatOpenAI<ChatOpenAICallOptions>;
    private vectorDatabase: VectorDatabase;

    constructor(vectorDatabase: VectorDatabase) {
        this.llm = new ChatOpenAI({
            temperature: CONFIG.openRouter.temperature,
            maxRetries: CONFIG.openRouter.maxRetries,
            modelName: CONFIG.openRouter.llmModel,
            openAIApiKey: CONFIG.openRouter.apiKey,
            configuration: {
                baseURL: CONFIG.openRouter.url,
                defaultHeaders: CONFIG.openRouter.defaultHeaders,
            },
        });
        this.vectorDatabase = vectorDatabase;
    }

    private async retrieveVectorSearchResults(input: ChainState): Promise<ChainState> {
        console.log(`🔍 Searching for similar documents for the question: "${input.question}"...`);
        const vectorResults = await this.vectorDatabase.searchSimilarDocumentsWithScores(input.question, CONFIG.similarity.topK);

        if (vectorResults.length === 0) {
            console.log("⚠️ No relevant documents found in the vector database.");
            return {
                ...input,
                error: "No relevant documents found in the vector database."
            };
        }

        const bestScore = vectorResults[0].score;
        console.log(`🔍 Found ${vectorResults.length} relevant documents. Best score: ${bestScore}`);

        const filteredResults = vectorResults.filter(result => result.score >= CONFIG.similarity.threshold);
        if (filteredResults.length === 0) {
            console.log(`⚠️ No documents met the similarity threshold of ${CONFIG.similarity.threshold}.`);
            return {
                ...input,
                error: `No documents met the similarity threshold of ${CONFIG.similarity.threshold}.`
            };
        }

        console.log(`🔍 ${filteredResults.length} documents met the similarity threshold of ${CONFIG.similarity.threshold}.`);

        const context = filteredResults.map(result => result.document.pageContent).join("\n\n");

        console.log(`\n🔍 Constructed context from relevant documents:\n\n${context}`);

        return {
            ...input,
            context,
            topScore: bestScore
        }
    }

    private async generateLLMResponse(input: ChainState): Promise<ChainState> {
        // TODO: Implement the logic to generate a response from the LLM using the context and question.
        return {
            ...input
        }
    }

    async answerQuestion(question: string): Promise<string> {
        const chain = RunnableSequence.from<ChainState>([
            this.retrieveVectorSearchResults.bind(this),
            this.generateLLMResponse.bind(this)
        ]);

        const result = await chain.invoke({ question, context: "" });

        return result.answer || "";
    }

}
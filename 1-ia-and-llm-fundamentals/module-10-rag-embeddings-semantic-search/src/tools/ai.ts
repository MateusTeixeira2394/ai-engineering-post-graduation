import { ChatOpenAI, type ChatOpenAICallOptions } from "@langchain/openai";
import { CONFIG } from "../config.ts";
import { RunnableSequence } from "@langchain/core/runnables";
import type { VectorDatabase } from "./vectorDatabase.ts";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import type { AnswerPrompt } from "../prompts/promptConfig.ts";

type ChainInput = {
    question: string;
}

type ChainState = ChainInput & {
    context?: string;
    topScore?: number;
    error?: string;
    answer?: string;
}

export class AI {

    // LLM instance
    private llm: ChatOpenAI<ChatOpenAICallOptions>;
    private vectorDatabase: VectorDatabase;

    private readonly threshold: number = CONFIG.similarity.threshold;
    private readonly topK: number = CONFIG.similarity.topK;
    private readonly templateText: string = CONFIG.templateText;
    private readonly answerPrompt: AnswerPrompt = CONFIG.answerPrompt;

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

    private async retrieveVectorSearchResults(input: ChainInput): Promise<ChainState> {
        console.log(`🔍 Searching for similar documents for the question: "${input.question}"...`);
        const vectorResults = await this.vectorDatabase.searchSimilarDocumentsWithScores(input.question, this.topK);

        if (vectorResults.length === 0) {
            console.log("⚠️ No relevant documents found in the vector database.");
            return {
                ...input,
                error: "No relevant documents found in the vector database."
            };
        }

        const bestScore = vectorResults[0].score;
        console.log(`🔍 Found ${vectorResults.length} relevant documents. Best score: ${bestScore}`);

        const filteredResults = vectorResults.filter(result => result.score >= this.threshold);
        if (filteredResults.length === 0) {
            console.log(`⚠️ No documents met the similarity threshold of ${this.threshold}.`);
            return {
                ...input,
                error: `No documents met the similarity threshold of ${this.threshold}.`
            };
        }

        console.log(`🔍 ${filteredResults.length} documents met the similarity threshold of ${this.threshold}.`);

        const context = filteredResults.map(result => result.document.pageContent).join("\n\n");

        console.log(`\n🔍 Constructed context from relevant documents:\n\n${context}`);

        return {
            ...input,
            context,
            topScore: bestScore
        }
    }

    private async generateLLMResponse(input: ChainState): Promise<ChainState> {
        if (input.error || !input.context) {
            return input;
        }

        const responsePrompt = ChatPromptTemplate.fromTemplate(this.templateText);

        const responseChain = responsePrompt
            .pipe(this.llm)
            .pipe(new StringOutputParser())

        const rawResponse = await responseChain.invoke({
            role: this.answerPrompt.role,
            task: this.answerPrompt.task,
            tone: this.answerPrompt.constraints.tone,
            language: this.answerPrompt.constraints.language,
            max_length: this.answerPrompt.constraints.max_length,
            format: this.answerPrompt.constraints.format,
            instructions: this.answerPrompt.instructions.map((instruction, index) => `Instruction ${index + 1}: ${instruction}`).join("\n"),
            examples: JSON.stringify(this.answerPrompt.examples),
            context_rules: JSON.stringify(this.answerPrompt.context_rules),
            question: input.question,
            context: input.context
        });

        return {
            ...input,
            answer: rawResponse
        }
    }

    async answerQuestion(question: string): Promise<string> {
        const chain = RunnableSequence.from<ChainInput, ChainState>([
            this.retrieveVectorSearchResults.bind(this),
            this.generateLLMResponse.bind(this)
        ]);

        const result = await chain.invoke({ question });

        return result.answer ?? result.error ?? "";
    }

}
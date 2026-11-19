import { ChatOpenAI } from '@langchain/openai';
import { config } from '../config.ts';
import { z } from 'zod';
import { createAgent, HumanMessage, providerStrategy, SystemMessage } from 'langchain';

export class OpenRouterService {
    private llmClient: ChatOpenAI;

    constructor() {
        this.llmClient = new ChatOpenAI({
            apiKey: config.apiKey,
            modelName: config.models.at(0),
            temperature: config.temperature,
            configuration: {
                baseURL: 'https://openrouter.ai/api/v1',
                defaultHeaders: {
                    'x-title': config.xTitle,
                    'Referer': config.httpReferer,
                },
            },
            // OpenRouter configuration for model selection and routing (smart routing)
            modelKwargs: {
                models: config.models,
                provider: config.provider,
            },
        });
    }

    public async generateStructuredOutput<T>(
        systemPrompt: string,
        userPrompt: string,
        schema: z.ZodSchema<T>
    ): Promise<any> {
        try {
            const agent = createAgent({
                model: this.llmClient,
                tools: [],
                responseFormat: providerStrategy(schema)
            });

            const messages = [
                new SystemMessage(systemPrompt),
                new HumanMessage(userPrompt)
            ]

            const data = await agent.invoke({ messages });

            return {
                success: true,
                data: data.structuredResponse,
            }
        } catch (error) {
            console.error('❌ Error generating structured output:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            }
        }
    }
}
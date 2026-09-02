import { OpenRouter } from '@openrouter/sdk';
import { config } from '../config.ts';
import { type LLMResponse } from '../dtos/llm.dto.ts';

export class LLMService {

    private client;

    constructor() {
        const { openRouterApiKey, xTitle, models } = config;

        this.client = new OpenRouter({
            apiKey: openRouterApiKey,
            appTitle: xTitle
        })
    }

    public async ask(question: string): Promise<LLMResponse> {
        const response = await this.client.chat.send({
            chatRequest: {
                models: config.models,
                stream: false,
                temperature: config.temperature,
                maxTokens: config.maxtokens,
                provider: config.provider,
                messages: [
                    {
                        role: 'user',
                        content: question,
                    },
                ],
            },
        })

        // `send` is typed as completion | stream; `stream: false` rules the
        // stream out at runtime, so narrow before touching `choices`.
        if (!('choices' in response)) {
            throw new Error('Open Router returned a stream for a non-streaming request');
        }

        const content = response.choices[0]?.message.content;
        const model = response.model;

        if (typeof content !== 'string') {
            throw new Error('Open Router returned no text content');
        }

        console.log('LLMService > send > LLMResponse', { model, content });

        return {
            model,
            content
        }
    }

}

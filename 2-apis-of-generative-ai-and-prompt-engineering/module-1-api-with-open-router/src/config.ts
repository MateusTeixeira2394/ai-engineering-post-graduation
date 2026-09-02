import type { ProviderPreferences } from '@openrouter/sdk/models';

console.assert(
    !!process.env.OPEN_ROUTER_API_KEY,
    'OPEN_ROUTER_API_KEY is not set in env variables'
)

export const config: Config = {
    openRouterApiKey: process.env.OPEN_ROUTER_API_KEY!,
    xTitle: 'MyFirstChatbot',
    port: 3000,
    /**
     * First entry is the model Open Router should use; the rest are the
     * fallbacks it tries, in order, when the previous one is unavailable.
     */
    models: [
        'openai/gpt-5.4-mini',
        'anthropic/claude-haiku-4.5',
        'google/gemini-3.5-flash-lite'
    ],
    temperature: 0.3,
    maxtokens: 100,
    /**
     * Routing preferences. `partition: 'none'` sorts every endpoint of every
     * model in `models` together by price, so the fallbacks stop being pure
     * fallbacks and compete with the primary on cost.
     */
    provider: {
        sort: {
            by: 'price',
            partition: 'none'
        }
    }
}

export type Config = {
    openRouterApiKey: string,
    xTitle: string;
    port: number;
    models: string[];
    temperature: number;
    maxtokens: number;
    provider: ProviderPreferences;
}

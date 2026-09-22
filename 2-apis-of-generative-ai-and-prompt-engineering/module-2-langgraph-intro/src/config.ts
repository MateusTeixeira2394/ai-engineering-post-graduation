console.assert(
    !!process.env.OPEN_ROUTER_API_KEY,
    'OPEN_ROUTER_API_KEY is not set in env variables'
)

/**
 * Everything the app needs from the outside world, in one place.
 * Open Router speaks the OpenAI protocol, so a plain `ChatOpenAI` client
 * pointed at `baseUrl` is all it takes to reach any model it serves.
 */
export const config: Config = {
    openRouterApiKey: process.env.OPEN_ROUTER_API_KEY!,
    baseUrl: 'https://openrouter.ai/api/v1',
    appTitle: 'LangGraphCasingBot',
    model: 'openai/gpt-5.4-mini',
    temperature: 0.3,
    maxTokens: 200,
    port: 3000
}

export type Config = {
    openRouterApiKey: string;
    baseUrl: string;
    appTitle: string;
    model: string;
    temperature: number;
    maxTokens: number;
    port: number;
}

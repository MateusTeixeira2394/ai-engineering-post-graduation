import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { config } from '../config.ts';

/**
 * A LangChain chat model is just an object with an `.invoke()` method, so it
 * drops straight into a LangGraph node. Open Router is OpenAI-compatible,
 * which is why the OpenAI client works here: only `baseURL` changes.
 */
const model = new ChatOpenAI({
    model: config.model,
    apiKey: config.openRouterApiKey,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
    configuration: {
        baseURL: config.baseUrl,
        defaultHeaders: {
            'X-Title': config.appTitle
        }
    }
});

export type Answer = {
    text: string;
    model: string;
}

/**
 * The one place that talks to the LLM. Both casing nodes call it with their
 * own system prompt, so each node stays about *its* rule and nothing else.
 */
export async function ask(systemPrompt: string, question: string): Promise<Answer> {
    const response = await model.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(question)
    ]);

    return {
        text: response.text,
        // Open Router reports the model it actually routed the call to.
        model: response.response_metadata?.model_name ?? config.model
    };
}

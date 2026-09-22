import type { GraphNode } from '@langchain/langgraph';
import { ask } from '../services/model.ts';
import type { ChatState } from './state.ts';

const SYSTEM_PROMPT = `You are a concise assistant. Answer in at most two sentences.
Write your ENTIRE answer in UPPERCASE LETTERS.`;

/**
 * The `uppercase` node. Reached only when `detectRule` set `rule: 'uppercase'`.
 *
 * Two layers of enforcement on purpose:
 *   1. the system prompt asks the model for uppercase — a soft request;
 *   2. `.toUpperCase()` guarantees it — models drift, code does not.
 *
 * Asking *and* enforcing is the habit worth copying: treat model output as a
 * suggestion your code is still responsible for.
 */
export const uppercaseNode: GraphNode<typeof ChatState> = async (state) => {
    const { text, model } = await ask(SYSTEM_PROMPT, state.message);

    console.log('[node: uppercase]', { model });

    return {
        answer: text.toUpperCase(),
        model
    };
};

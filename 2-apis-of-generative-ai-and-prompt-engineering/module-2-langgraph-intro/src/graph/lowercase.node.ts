import type { GraphNode } from '@langchain/langgraph';
import { ask } from '../services/model.ts';
import type { ChatState } from './state.ts';

const SYSTEM_PROMPT = `You are a concise assistant. Answer in at most two sentences.
Write your entire answer in lowercase letters, with no capital letters at all.`;

/**
 * The `lowercase` node — the mirror image of `uppercase.node.ts`.
 *
 * Both nodes have the same signature and both write the same two state fields.
 * That is what makes them interchangeable branches: the graph does not care
 * which one runs, only that whichever runs fills in `answer` and `model`.
 */
export const lowercaseNode: GraphNode<typeof ChatState> = async (state) => {
    const { text, model } = await ask(SYSTEM_PROMPT, state.message);

    console.log('[node: lowercase]', { model });

    return {
        answer: text.toLowerCase(),
        model
    };
};

import type { GraphNode } from '@langchain/langgraph';
import type { CasingRule, ChatState } from './state.ts';

/**
 * Is the message written entirely in capitals?
 *
 * `toUpperCase()` leaves digits and punctuation alone, so comparing a string
 * to its own uppercase form only tells us something when there is at least
 * one letter — hence the `\p{L}` guard. `\p{L}` is the Unicode "any letter"
 * class, so accented letters count too ("ÁGUA" is uppercase, "água" is not).
 *
 * Anything that is not entirely uppercase — including mixed case like
 * "What is LangGraph?" — falls through to `lowercase`.
 */
function detect(message: string): CasingRule {
    const hasLetters = /\p{L}/u.test(message);

    return hasLetters && message === message.toUpperCase()
        ? 'uppercase'
        : 'lowercase';
}

/**
 * ── LangGraph concept #2: NODE ─────────────────────────────────────────────
 *
 * A node is just a function: it takes the current state and returns a partial
 * update. No LangGraph class to extend, no base class to inherit. This one
 * does not even call the LLM — a node can be plain logic, and keeping the
 * decision deterministic makes the graph cheap to run and easy to reason about.
 *
 * It writes only `rule`; `message` passes through untouched.
 */
export const detectRuleNode: GraphNode<typeof ChatState> = (state) => {
    const rule = detect(state.message);

    console.log('[node: detectRule]', { message: state.message, rule });

    return { rule };
};

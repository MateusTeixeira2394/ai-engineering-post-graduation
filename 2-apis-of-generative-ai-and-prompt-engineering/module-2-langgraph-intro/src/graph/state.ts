import * as z from 'zod';
import { StateSchema } from '@langchain/langgraph';

/**
 * The two casing rules the graph knows. The values are *also* the names of
 * the two nodes that apply them, which is what lets the router in
 * `router.ts` be a single line.
 */
export const casingRule = z.enum(['uppercase', 'lowercase']);

export type CasingRule = z.infer<typeof casingRule>;

/**
 * ── LangGraph concept #1: STATE ────────────────────────────────────────────
 *
 * The state is the single object every node reads from and writes to. It is
 * the graph's memory for one run.
 *
 * A node never mutates it. A node *returns a partial update* — an object with
 * only the fields it wants to change — and LangGraph merges that into the
 * state before moving on. That is why each field below is written by exactly
 * one place, and why you can follow a request by reading the table in the
 * README instead of tracing calls.
 *
 * Fields with `.default()` are optional when you call `graph.invoke()`;
 * `message` has no default, so it is the required input.
 */
export const ChatState = new StateSchema({
    /** The user's question. Written by the HTTP layer, read by every node. */
    message: z.string(),

    /** Which casing to answer in. Written by the `detectRule` node. */
    rule: casingRule.default('lowercase'),

    /** The final, already-transformed answer. Written by a casing node. */
    answer: z.string().default(''),

    /** Which model Open Router used. Written by a casing node. */
    model: z.string().default('')
});

/** The shape a node receives. */
export type ChatStateValue = typeof ChatState.State;

/** The shape a node may return. */
export type ChatStateUpdate = typeof ChatState.Update;

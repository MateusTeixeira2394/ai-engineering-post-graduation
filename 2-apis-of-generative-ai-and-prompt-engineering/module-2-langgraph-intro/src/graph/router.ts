import type { ConditionalEdgeRouter } from '@langchain/langgraph';
import type { ChatState } from './state.ts';

/**
 * ── LangGraph concept #3: CONDITIONAL EDGE ─────────────────────────────────
 *
 * A normal edge is static: "after A, always go to B". A conditional edge is
 * decided at runtime by a router function — it reads the state and returns
 * the *name* of the node to run next (or `END` to stop).
 *
 * A router only chooses. It never returns a state update, which is why the
 * choosing lives here and not inside `detectRule`: the node decides *what the
 * rule is*, the router decides *where that leads*.
 *
 * Because the node names match the `rule` values one-to-one, the whole routing
 * decision is `state.rule`.
 */
export const routeByRule: ConditionalEdgeRouter<{
    InputSchema: typeof ChatState;
    Nodes: 'uppercase' | 'lowercase';
}> = (state) => state.rule;

import { END, START, StateGraph } from '@langchain/langgraph';
import { detectRuleNode } from './detect-rule.node.ts';
import { lowercaseNode } from './lowercase.node.ts';
import { routeByRule } from './router.ts';
import { ChatState } from './state.ts';
import { uppercaseNode } from './uppercase.node.ts';

/**
 * ── LangGraph concept #4: THE GRAPH ────────────────────────────────────────
 *
 * Nodes are the work, edges are the wiring, and this file is the only place
 * that knows the shape of the whole thing:
 *
 *                       START
 *                         │
 *                    detectRule            pure logic, no LLM call
 *                         │
 *                   (routeByRule)          conditional edge
 *                    ╱         ╲
 *             uppercase       lowercase    one LLM call each
 *                    ╲         ╱
 *                        END
 *
 * `START` and `END` are LangGraph's two built-in virtual nodes: where a run
 * begins and where it finishes.
 *
 * `.compile()` validates the wiring once, at startup — an edge pointing at a
 * node that does not exist fails here rather than on the first request — and
 * returns a runnable you call with `.invoke()`.
 */
export const chatGraph = new StateGraph(ChatState)
    // Register the three nodes. The string is the node's name, and names are
    // how edges refer to nodes.
    .addNode('detectRule', detectRuleNode)
    .addNode('uppercase', uppercaseNode)
    .addNode('lowercase', lowercaseNode)

    // Every run starts at `detectRule`.
    .addEdge(START, 'detectRule')

    // After `detectRule`, ask the router where to go. The third argument lists
    // the reachable nodes: optional, but it makes the branch explicit and lets
    // LangGraph draw the graph correctly.
    .addConditionalEdges('detectRule', routeByRule, ['uppercase', 'lowercase'])

    // Whichever branch ran, the run is over.
    .addEdge('uppercase', END)
    .addEdge('lowercase', END)

    .compile();

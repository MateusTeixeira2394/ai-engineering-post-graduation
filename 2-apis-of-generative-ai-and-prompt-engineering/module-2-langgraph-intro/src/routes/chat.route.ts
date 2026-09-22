import type { FastifyInstance } from 'fastify';
import { chatGraph } from '../graph/chat.graph.ts';
import { chatSchema } from '../schemas/chat.schema.ts';

type ChatBody = {
    message: string;
}

export async function chatRoutes(app: FastifyInstance): Promise<void> {

    /**
     * ── LangGraph concept #5: INVOKE ───────────────────────────────────────
     *
     * The whole graph collapses into one call. You hand `invoke` the input
     * state and get the final state back, after every node it visited has
     * merged its update in.
     *
     * Note what the HTTP layer does *not* know: which branch ran, how many
     * nodes exist, or that an LLM was involved. Add a fourth node tomorrow
     * and this file does not change.
     */
    app.post<{ Body: ChatBody }>('/', { schema: chatSchema }, async (request, reply) => {
        const { message } = request.body;

        try {
            const result = await chatGraph.invoke({ message });

            return reply.status(200).send({
                rule: result.rule,
                answer: result.answer,
                model: result.model
            });
        } catch (error) {
            request.log.error(error);

            return reply.status(502).send({
                message: 'The model could not be reached. Check OPEN_ROUTER_API_KEY and try again.'
            });
        }
    });

}

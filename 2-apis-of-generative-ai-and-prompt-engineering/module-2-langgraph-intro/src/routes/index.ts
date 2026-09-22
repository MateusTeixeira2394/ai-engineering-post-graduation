import type { FastifyInstance } from 'fastify';
import { chatRoutes } from './chat.route.ts';

/** Single entry point for every route module of the API. */
export async function routes(app: FastifyInstance): Promise<void> {

    app.get('/health', async () => ({ status: 'ok' }));

    await app.register(chatRoutes, { prefix: '/chat' });

}

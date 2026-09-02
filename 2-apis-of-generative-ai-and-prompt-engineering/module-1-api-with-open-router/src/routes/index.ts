import type { FastifyInstance } from 'fastify';
import { chatRoutes } from './chat.route.ts';

/**
 * Single entry point for every route module of the API.
 * Register new modules here so `server.ts` keeps a single registration call.
 */
export async function routes(app: FastifyInstance): Promise<void> {

    app.get('/health', async () => ({ status: 'ok' }));

    await app.register(chatRoutes, { prefix: '/chat' });

}

import Fastify, { type FastifyInstance } from 'fastify';
import { routes } from './routes/index.ts';

export class Server {

    private server: FastifyInstance;

    constructor() {
        this.server = Fastify({
            logger: false
        })

        this.registerRoutes();
    }

    private registerRoutes(): void {
        this.server.register(routes);
    }

    public load(port: number): void {
        this.server.listen({ port }, (err, address) => {
            if (err) {
                this.server.log.error(err)
                throw new Error('The application wasn\`t able to start')
            }
            console.log('Server running at the port ' + port);
        });
    }


}





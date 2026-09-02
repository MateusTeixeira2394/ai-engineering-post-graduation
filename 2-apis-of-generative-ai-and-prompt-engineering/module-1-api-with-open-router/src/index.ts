import { config } from "./config.ts";
import { Server } from "./server.ts";

function main() {

    const server = new Server();

    server.load(config.port);
}

main();
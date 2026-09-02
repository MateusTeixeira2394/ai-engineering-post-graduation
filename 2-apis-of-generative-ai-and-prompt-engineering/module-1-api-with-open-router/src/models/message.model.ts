import { randomUUID } from 'node:crypto';

export type MessageRole = 'user' | 'assistant';

/**
 * Domain entity. Knows how to build itself and nothing about HTTP.
 */
export class Message {

    id: string;
    role: MessageRole;
    content: string;
    createdAt: string;

    constructor(role: MessageRole, content: string) {
        this.id = randomUUID();
        this.role = role;
        this.content = content;
        this.createdAt = new Date().toISOString();
    }

}

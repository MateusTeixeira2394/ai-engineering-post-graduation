import { randomUUID } from 'node:crypto';
import { Message, type MessageRole } from './message.model.ts';

const TITLE_MAX_LENGTH = 60;

/**
 * Domain entity. Owns its own invariants: how a chat is created and
 * how its history grows. Layers above only ask it to do things.
 */
export class Chat {

    id: string;
    title: string;
    messages: Message[];
    createdAt: string;
    updatedAt: string;

    constructor(title: string) {
        const now = new Date().toISOString();

        this.id = randomUUID();
        this.title = title.slice(0, TITLE_MAX_LENGTH);
        this.messages = [];
        this.createdAt = now;
        this.updatedAt = now;
    }

    public append(role: MessageRole, content: string): Message {
        const message = new Message(role, content);

        this.messages.push(message);
        this.updatedAt = message.createdAt;

        return message;
    }

    public get messagesCount(): number {
        return this.messages.length;
    }

}

import type { FastifyReply, FastifyRequest } from 'fastify';
import { Chat } from '../models/chat.model.ts';
import {
    toChatDetailDto,
    toChatSummaryDto,
    toSendChatResponseDto,
    type ChatParamsDto,
    type SendChatRequestDto
} from '../dtos/chat.dto.ts';
import { LLMService } from '../services/llm.service.ts';

export class ChatController {

    /**
     * Placeholder storage. Swap for the Open Router service + a real
     * repository when the module gets its AI integration.
     */
    private chats = new Map<string, Chat>();
    private llmService: LLMService;

    constructor() {
        this.llmService = new LLMService();
    }

    public list = async (_request: FastifyRequest, reply: FastifyReply) => {
        const chats = [...this.chats.values()].map(toChatSummaryDto);

        return reply.status(200).send({ chats });
    };

    public show = async (
        request: FastifyRequest<{ Params: ChatParamsDto }>,
        reply: FastifyReply
    ) => {
        const chat = this.chats.get(request.params.id);

        if (!chat) {
            return reply.status(404).send({ message: 'Chat not found' });
        }

        return reply.status(200).send(toChatDetailDto(chat));
    };

    public send = async (
        request: FastifyRequest<{ Body: SendChatRequestDto }>,
        reply: FastifyReply
    ) => {
        const { chatId, message } = request.body;

        const chat = chatId ? this.chats.get(chatId) : this.create(message);

        if (!chat) {
            return reply.status(404).send({ message: 'Chat not found' });
        }

        const userMessage = chat.append('user', message);

        const { content } = await this.llmService.ask(message);

        const answer = chat.append(
            'assistant',
            content
        )

        return reply
            .status(chatId ? 200 : 201)
            .send(toSendChatResponseDto(chat, userMessage, answer));
    };

    public remove = async (
        request: FastifyRequest<{ Params: ChatParamsDto }>,
        reply: FastifyReply
    ) => {
        if (!this.chats.delete(request.params.id)) {
            return reply.status(404).send({ message: 'Chat not found' });
        }

        return reply.status(204).send();
    };

    private create(title: string): Chat {
        const chat = new Chat(title);

        this.chats.set(chat.id, chat);

        return chat;
    }

}

export const chatController = new ChatController();

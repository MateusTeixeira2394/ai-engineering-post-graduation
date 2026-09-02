import type { FastifyInstance } from 'fastify';
import { chatController } from '../controllers/chat.controller.ts';
import type { ChatParamsDto, SendChatRequestDto } from '../dtos/chat.dto.ts';
import {
    listChatsSchema,
    removeChatSchema,
    sendChatSchema,
    showChatSchema
} from '../schemas/chat.schema.ts';

export async function chatRoutes(app: FastifyInstance): Promise<void> {

    app.get('/', { schema: listChatsSchema }, chatController.list);

    app.get<{ Params: ChatParamsDto }>(
        '/:id',
        { schema: showChatSchema },
        chatController.show
    );

    app.post<{ Body: SendChatRequestDto }>(
        '/',
        { schema: sendChatSchema },
        chatController.send
    );

    app.delete<{ Params: ChatParamsDto }>(
        '/:id',
        { schema: removeChatSchema },
        chatController.remove
    );

}

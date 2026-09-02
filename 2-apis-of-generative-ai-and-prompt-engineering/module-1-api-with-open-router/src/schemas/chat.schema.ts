/**
 * JSON Schemas used by Fastify to validate incoming requests and to
 * serialize responses. They mirror the DTOs in `src/dtos/chat.dto.ts`:
 * the DTOs are the compile-time contract, these are the runtime one.
 */

/* -------------------------------- pieces -------------------------------- */

const messageSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        role: { type: 'string', enum: ['user', 'assistant'] },
        content: { type: 'string' },
        createdAt: { type: 'string' }
    }
} as const;

const chatSummarySchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        messagesCount: { type: 'integer' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' }
    }
} as const;

const chatDetailSchema = {
    type: 'object',
    properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
        messages: { type: 'array', items: messageSchema }
    }
} as const;

const errorSchema = {
    type: 'object',
    properties: {
        message: { type: 'string' }
    }
} as const;

export const chatParamsSchema = {
    type: 'object',
    required: ['id'],
    properties: {
        id: { type: 'string', format: 'uuid' }
    }
} as const;

export const sendChatBodySchema = {
    type: 'object',
    required: ['message'],
    additionalProperties: false,
    properties: {
        chatId: { type: 'string', format: 'uuid' },
        message: { type: 'string', minLength: 1, maxLength: 4000 }
    }
} as const;

/* ---------------------------- per-route bundles -------------------------- */

export const listChatsSchema = {
    response: {
        200: {
            type: 'object',
            properties: {
                chats: { type: 'array', items: chatSummarySchema }
            }
        }
    }
} as const;

export const showChatSchema = {
    params: chatParamsSchema,
    response: {
        200: chatDetailSchema,
        404: errorSchema
    }
} as const;

const sendChatResponseSchema = {
    type: 'object',
    properties: {
        chatId: { type: 'string' },
        message: messageSchema,
        answer: messageSchema
    }
} as const;

export const sendChatSchema = {
    body: sendChatBodySchema,
    response: {
        200: sendChatResponseSchema,
        201: sendChatResponseSchema,
        404: errorSchema
    }
} as const;

export const removeChatSchema = {
    params: chatParamsSchema,
    response: {
        204: { type: 'null' },
        404: errorSchema
    }
} as const;

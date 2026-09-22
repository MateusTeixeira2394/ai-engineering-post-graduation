/**
 * JSON Schemas Fastify uses to validate the request and serialize the
 * response. Keeping them here means the route file stays about routing.
 */

const chatBodySchema = {
    type: 'object',
    required: ['message'],
    additionalProperties: false,
    properties: {
        message: { type: 'string', minLength: 1, maxLength: 2000 }
    }
} as const;

const chatResponseSchema = {
    type: 'object',
    properties: {
        rule: { type: 'string', enum: ['uppercase', 'lowercase'] },
        answer: { type: 'string' },
        model: { type: 'string' }
    }
} as const;

const errorSchema = {
    type: 'object',
    properties: {
        message: { type: 'string' }
    }
} as const;

export const chatSchema = {
    body: chatBodySchema,
    response: {
        200: chatResponseSchema,
        502: errorSchema
    }
} as const;

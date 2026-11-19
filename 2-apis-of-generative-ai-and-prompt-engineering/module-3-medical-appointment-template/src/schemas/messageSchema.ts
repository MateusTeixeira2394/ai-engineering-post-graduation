import { z } from 'zod';

export const MessageSchema = z.object({
    message: z.string().min(10).describe('Clear, friendly message for the user')
});
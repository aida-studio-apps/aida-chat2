import { z } from 'zod';
export const sendMessageSchema = z.object({
    conversationId: z.string().optional(),
    message: z.string().trim().min(1).max(5000),
});
export const renameConversationSchema = z.object({
    title: z.string().trim().min(1).max(120),
});

import z from 'zod';

// MessageResponse
export const MessageResponseSchema = z.object({
  message: z.string(),
});

export type MessageResponsePayload = z.infer<typeof MessageResponseSchema>;

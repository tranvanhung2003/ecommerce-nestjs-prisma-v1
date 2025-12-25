import z from 'zod';

// EmptyBody
export const EmptyBodySchema = z.object({});

export type EmptyBodyPayload = z.infer<typeof EmptyBodySchema>;

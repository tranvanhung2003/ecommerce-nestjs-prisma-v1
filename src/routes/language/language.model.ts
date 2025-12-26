import { Language } from 'src/generated/prisma/client';
import z from 'zod';

// Language
export const LanguageSchema = z.object({
  id: z.string().max(10),
  name: z.string().max(500),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
}) satisfies z.ZodType<Language>;

export type LanguagePayload = z.infer<typeof LanguageSchema>;

// CreateLanguage
export const CreateLanguageSchema = LanguageSchema.pick({
  id: true,
  name: true,
});

export type CreateLanguagePayload = z.infer<typeof CreateLanguageSchema>;

// LanguageListResponse
export const LanguageListResponseSchema = z.object({
  data: z.array(LanguageSchema),
  totalItems: z.number(),
});

export type LanguageListResponsePayload = z.infer<
  typeof LanguageListResponseSchema
>;

// LanguageResponse
export const LanguageResponseSchema = LanguageSchema;

export type LanguageResponsePayload = z.infer<typeof LanguageResponseSchema>;

// UpdateLanguage
export const UpdateLanguageSchema = CreateLanguageSchema.omit({
  id: true,
});

export type UpdateLanguagePayload = z.infer<typeof UpdateLanguageSchema>;

// LanguageParams
export const LanguageParamsSchema = z.object({
  id: z.string().max(10),
});

export type LanguageParamsPayload = z.infer<typeof LanguageParamsSchema>;

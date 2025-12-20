import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import z from 'zod';

export const InputTokenSchema = z.object({
  userId: z.number(),
  deviceId: z.number(),
  roleId: z.number(),
  roleName: z.string(),
});

export type InputTokenPayload = z.infer<typeof InputTokenSchema>;

export interface OutputTokenPayload extends InputTokenPayload {
  iat: number;
  exp: number;
}

export type SignOptions = Pick<JwtSignOptions, 'secret' | 'expiresIn'>;

export type ExpiresIn = JwtSignOptions['expiresIn'];

export type VerifyOptions = Pick<JwtVerifyOptions, 'secret'>;

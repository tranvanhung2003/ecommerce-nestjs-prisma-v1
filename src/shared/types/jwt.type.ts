import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import z from 'zod';

export type SignOptions = Pick<JwtSignOptions, 'secret' | 'expiresIn'>;

export type VerifyOptions = Pick<JwtVerifyOptions, 'secret'>;

// ----------------------------------------------------------------------------------------------------

type WithIatAndExp<T> = T & {
  iat: number;
  exp: number;
};

interface Kind$Payload<K, P> {
  kind: K;
  payload: P;
}

// ----------------------------------------------------------------------------------------------------

export const InputAccessTokenSchema = z.object({
  userId: z.number(),
  deviceId: z.number(),
  roleId: z.number(),
  roleName: z.string(),
});

export type InputAccessTokenPayload = z.infer<typeof InputAccessTokenSchema>;

export type OutputAccessTokenPayload = WithIatAndExp<InputAccessTokenPayload>;

// ----------------------------------------------------------------------------------------------------

export const InputRefreshTokenSchema = z.object({
  userId: z.number(),
});

export type InputRefreshTokenPayload = z.infer<typeof InputRefreshTokenSchema>;

export type OutputRefreshTokenPayload = WithIatAndExp<InputRefreshTokenPayload>;

// ----------------------------------------------------------------------------------------------------

export type InputTokenPayload =
  | InputAccessTokenPayload
  | InputRefreshTokenPayload;

export type OutputTokenPayload =
  | OutputAccessTokenPayload
  | OutputRefreshTokenPayload;

// ----------------------------------------------------------------------------------------------------

export const TokenKind = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

type TokenKindType = typeof TokenKind;

type TokenKind = (typeof TokenKind)[keyof typeof TokenKind];

// ----------------------------------------------------------------------------------------------------

export type Kind$InputAccessTokenPayload = Kind$Payload<
  TokenKindType['ACCESS_TOKEN'],
  InputAccessTokenPayload
>;

export type Kind$InputRefreshTokenPayload = Kind$Payload<
  TokenKindType['REFRESH_TOKEN'],
  InputRefreshTokenPayload
>;

export type Kind$InputTokenPayload =
  | Kind$InputAccessTokenPayload
  | Kind$InputRefreshTokenPayload;

// ----------------------------------------------------------------------------------------------------

export type AccessTokenKind$StringPayload = Kind$Payload<
  TokenKindType['ACCESS_TOKEN'],
  string
>;

export type RefreshTokenKind$StringPayload = Kind$Payload<
  TokenKindType['REFRESH_TOKEN'],
  string
>;

export type TokenKind$StringPayload =
  | AccessTokenKind$StringPayload
  | RefreshTokenKind$StringPayload;

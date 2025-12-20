import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import z from 'zod';

export type SignOptions = Pick<JwtSignOptions, 'secret' | 'expiresIn'>;

export type VerifyOptions = Pick<JwtVerifyOptions, 'secret'>;

//

type WithIatAndExp<T> = T & {
  iat: number;
  exp: number;
};

interface Kind_Payload<Kind, Payload> {
  kind: Kind;
  payload: Payload;
}

//

export const InputAccessTokenSchema = z.object({
  userId: z.number(),
  deviceId: z.number(),
  roleId: z.number(),
  roleName: z.string(),
});

export type InputAccessTokenPayload = z.infer<typeof InputAccessTokenSchema>;

export type OutputAccessTokenPayload = WithIatAndExp<InputAccessTokenPayload>;

//

export const InputRefreshTokenSchema = z.object({
  userId: z.number(),
});

export type InputRefreshTokenPayload = z.infer<typeof InputRefreshTokenSchema>;

export type OutputRefreshTokenPayload = WithIatAndExp<InputRefreshTokenPayload>;

//

export const TokenKind = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

type TokenKindType = typeof TokenKind;

type TokenKind = (typeof TokenKind)[keyof typeof TokenKind];

//

export type Kind_InputAccessTokenPayload = Kind_Payload<
  TokenKindType['ACCESS_TOKEN'],
  InputAccessTokenPayload
>;

export type Kind_InputRefreshTokenPayload = Kind_Payload<
  TokenKindType['REFRESH_TOKEN'],
  InputRefreshTokenPayload
>;

export type Kind_InputTokenPayload =
  | Kind_InputAccessTokenPayload
  | Kind_InputRefreshTokenPayload;

//

export type AccessTokenKind_StringPayload = Kind_Payload<
  TokenKindType['ACCESS_TOKEN'],
  string
>;

export type RefreshTokenKind_StringPayload = Kind_Payload<
  TokenKindType['REFRESH_TOKEN'],
  string
>;

export type TokenKind_StringPayload =
  | AccessTokenKind_StringPayload
  | RefreshTokenKind_StringPayload;

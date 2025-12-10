import { JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';

export interface EncodedPayload {
  userId: number;
}

export interface DecodedPayload extends EncodedPayload {
  iat: number;
  exp: number;
}

export type SignOptions = Pick<JwtSignOptions, 'secret' | 'expiresIn'>;

export type ExpiresIn = JwtSignOptions['expiresIn'];

export type VerifyOptions = Pick<JwtVerifyOptions, 'secret'>;

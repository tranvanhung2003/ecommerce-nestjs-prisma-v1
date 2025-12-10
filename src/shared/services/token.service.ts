import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import envConfig from '../config';
import {
  DecodedPayload,
  EncodedPayload,
  ExpiresIn,
  SignOptions,
  VerifyOptions,
} from '../types/jwt.type';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  private async signToken(payload: EncodedPayload, options: SignOptions) {
    return await this.jwtService.signAsync<EncodedPayload>(payload, {
      ...options,
      algorithm: 'HS256',
    });
  }

  private async verifyToken(token: string, options: VerifyOptions) {
    return await this.jwtService.verifyAsync<DecodedPayload>(token, options);
  }

  async signAccessToken(payload: EncodedPayload) {
    return await this.signToken(payload, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
      expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN as ExpiresIn,
    });
  }

  async signRefreshToken(payload: EncodedPayload) {
    return await this.signToken(payload, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
      expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN as ExpiresIn,
    });
  }

  async verifyAccessToken(token: string) {
    return await this.verifyToken(token, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    });
  }

  async verifyRefreshToken(token: string) {
    return await this.verifyToken(token, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    });
  }
}

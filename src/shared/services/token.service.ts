import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import envConfig from '../config';
import { assertNever } from '../helpers/helpers';
import {
  AccessTokenKind$StringPayload,
  InputAccessTokenPayload,
  InputAccessTokenSchema,
  InputRefreshTokenPayload,
  InputRefreshTokenSchema,
  InputTokenPayload,
  Kind$InputTokenPayload,
  OutputAccessTokenPayload,
  OutputRefreshTokenPayload,
  OutputTokenPayload,
  RefreshTokenKind$StringPayload,
  SignOptions,
  TokenKind,
  TokenKind$StringPayload,
  VerifyOptions,
} from '../types/jwt.type';

@Injectable()
export class TokenService {
  private readonly ALGORITHM = 'HS256';

  constructor(private readonly jwtService: JwtService) {}

  private addUuidToPayload<T extends InputTokenPayload>(payload: T) {
    return { ...payload, uuid: uuidv4() };
  }

  private async signToken(
    kind$inputTokenPayload: Kind$InputTokenPayload,
    signOptions: SignOptions,
  ) {
    const { payload } = kind$inputTokenPayload;

    switch (kind$inputTokenPayload.kind) {
      case TokenKind.ACCESS_TOKEN: {
        const $payload = InputAccessTokenSchema.parse(payload);

        return await this.jwtService.signAsync<InputAccessTokenPayload>(
          this.addUuidToPayload($payload),
          {
            ...signOptions,
            algorithm: this.ALGORITHM,
          },
        );
      }
      case TokenKind.REFRESH_TOKEN: {
        const $payload = InputRefreshTokenSchema.parse(payload);

        return await this.jwtService.signAsync<InputRefreshTokenPayload>(
          this.addUuidToPayload($payload),
          {
            ...signOptions,
            algorithm: this.ALGORITHM,
          },
        );
      }
      default: {
        assertNever(kind$inputTokenPayload);
      }
    }
  }

  private async verifyToken(
    accessTokenKind$stringPayload: AccessTokenKind$StringPayload,
    verifyOptions: VerifyOptions,
  ): Promise<OutputAccessTokenPayload>;

  private async verifyToken(
    refreshTokenKind$stringPayload: RefreshTokenKind$StringPayload,
    verifyOptions: VerifyOptions,
  ): Promise<OutputRefreshTokenPayload>;

  private async verifyToken(
    tokenKind$stringPayload: TokenKind$StringPayload,
    verifyOptions: VerifyOptions,
  ): Promise<OutputTokenPayload> {
    const { payload } = tokenKind$stringPayload;

    switch (tokenKind$stringPayload.kind) {
      case TokenKind.ACCESS_TOKEN: {
        return await this.jwtService.verifyAsync<OutputAccessTokenPayload>(
          payload,
          verifyOptions,
        );
      }
      case TokenKind.REFRESH_TOKEN: {
        return await this.jwtService.verifyAsync<OutputRefreshTokenPayload>(
          payload,
          verifyOptions,
        );
      }
      default: {
        assertNever(tokenKind$stringPayload);
      }
    }
  }

  async signAccessToken(payload: InputAccessTokenPayload) {
    return await this.signToken(
      { kind: TokenKind.ACCESS_TOKEN, payload },
      {
        secret: envConfig.ACCESS_TOKEN_SECRET,
        expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN as ms.StringValue,
      },
    );
  }

  async signRefreshToken(payload: InputRefreshTokenPayload) {
    return await this.signToken(
      { kind: TokenKind.REFRESH_TOKEN, payload },
      {
        secret: envConfig.REFRESH_TOKEN_SECRET,
        expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN as ms.StringValue,
      },
    );
  }

  async verifyAccessToken(token: string) {
    return await this.verifyToken(
      { kind: TokenKind.ACCESS_TOKEN, payload: token },
      {
        secret: envConfig.ACCESS_TOKEN_SECRET,
      },
    );
  }

  async verifyRefreshToken(token: string) {
    return await this.verifyToken(
      { kind: TokenKind.REFRESH_TOKEN, payload: token },
      {
        secret: envConfig.REFRESH_TOKEN_SECRET,
      },
    );
  }
}

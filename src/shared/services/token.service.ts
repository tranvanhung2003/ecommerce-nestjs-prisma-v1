import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import envConfig from '../config';
import { assertNever } from '../helpers/helpers';
import {
  AccessTokenKind_StringPayload,
  InputAccessTokenPayload,
  InputAccessTokenSchema,
  InputRefreshTokenPayload,
  InputRefreshTokenSchema,
  InputTokenPayload,
  Kind_InputTokenPayload,
  OutputAccessTokenPayload,
  OutputRefreshTokenPayload,
  RefreshTokenKind_StringPayload,
  SignOptions,
  TokenKind,
  TokenKind_StringPayload,
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
    kind_inputTokenPayload: Kind_InputTokenPayload,
    signOptions: SignOptions,
  ) {
    const { payload } = kind_inputTokenPayload;

    switch (kind_inputTokenPayload.kind) {
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
        assertNever(kind_inputTokenPayload);
      }
    }
  }

  private async verifyToken(
    accessTokenKind_stringPayload: AccessTokenKind_StringPayload,
    verifyOptions: VerifyOptions,
  ): Promise<OutputAccessTokenPayload>;

  private async verifyToken(
    refreshTokenKind_stringPayload: RefreshTokenKind_StringPayload,
    verifyOptions: VerifyOptions,
  ): Promise<OutputRefreshTokenPayload>;

  private async verifyToken(
    tokenKind_stringPayload: TokenKind_StringPayload,
    verifyOptions: VerifyOptions,
  ) {
    const { payload } = tokenKind_stringPayload;

    switch (tokenKind_stringPayload.kind) {
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
        assertNever(tokenKind_stringPayload);
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

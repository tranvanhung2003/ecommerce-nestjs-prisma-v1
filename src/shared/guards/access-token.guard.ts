import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../constants/auth.constant';
import { TokenService } from '../services/token.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<true> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const accessToken = request.headers.authorization?.split(' ')[1];

      if (!accessToken) {
        throw new UnauthorizedException('Access token is missing');
      }

      const decodedAccessToken =
        await this.tokenService.verifyAccessToken(accessToken);

      request[REQUEST_USER_KEY] = decodedAccessToken;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

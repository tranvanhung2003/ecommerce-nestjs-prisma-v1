import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import envConfig from '../config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): true {
    const request = context.switchToHttp().getRequest<Request>();
    const xApiKey = request.headers['x-api-key'];

    if (!xApiKey) {
      throw new UnauthorizedException('API key bị thiếu');
    }

    if (xApiKey !== envConfig.SECRET_API_KEY) {
      throw new UnauthorizedException('API key không hợp lệ');
    }

    return true;
  }
}

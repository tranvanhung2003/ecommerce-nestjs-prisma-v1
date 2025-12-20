import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../constants/auth.constant';
import { OutputTokenPayload } from '../types/jwt.type';

export const User = createParamDecorator(
  (field: keyof OutputTokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request[REQUEST_USER_KEY] as OutputTokenPayload | undefined;

    return field ? user?.[field] : user;
  },
);

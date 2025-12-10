import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { REQUEST_USER_KEY } from '../constants/auth.constant';
import { DecodedPayload } from '../types/jwt.type';

export const User = createParamDecorator(
  (field: keyof DecodedPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request[REQUEST_USER_KEY] as DecodedPayload | undefined;

    return field ? user?.[field] : user;
  },
);

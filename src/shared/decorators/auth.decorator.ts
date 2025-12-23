import { SetMetadata } from '@nestjs/common';
import { AuthType, ConditionGuard } from '../constants/auth.constant';
import { AuthTypeDecoratorPayload } from '../types/auth.type';

export const AUTH_TYPE_KEY = 'authType';

export const Auth = (authTypeDecoratorPayload?: AuthTypeDecoratorPayload) =>
  SetMetadata<string, AuthTypeDecoratorPayload>(
    AUTH_TYPE_KEY,
    authTypeDecoratorPayload ?? {
      authTypes: [AuthType.BEARER],
      options: { condition: ConditionGuard.AND },
    },
  );

export const IsPublic = () => SetMetadata(AUTH_TYPE_KEY, null);

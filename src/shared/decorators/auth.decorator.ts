import { SetMetadata } from '@nestjs/common';
import { ConditionGuard } from '../constants/auth.constant';
import {
  AuthTypeDecoratorPayload,
  AuthTypeType,
  ConditionGuardType,
} from '../types/auth.type';

export const AUTH_TYPE_KEY = 'authType';

export const Auth = (
  authTypes: AuthTypeType[],
  options?: { condition: ConditionGuardType },
) =>
  SetMetadata<string, AuthTypeDecoratorPayload>(AUTH_TYPE_KEY, {
    authTypes,
    options: options ?? { condition: ConditionGuard.AND },
  });

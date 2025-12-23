import { SetMetadata } from '@nestjs/common';
import { AuthType, ConditionGuard } from '../constants/auth.constant';
import {
  AssignUserPayload,
  AuthTypeDecoratorPayload,
} from '../types/auth.type';

export const AUTH_TYPE_KEY = 'authType';

export const Auth = (authTypeDecoratorPayload?: AuthTypeDecoratorPayload) =>
  SetMetadata<string, AuthTypeDecoratorPayload>(
    AUTH_TYPE_KEY,
    authTypeDecoratorPayload ?? {
      authTypes: [AuthType.BEARER],
      options: { condition: ConditionGuard.AND },
    },
  );

export const IsPublic = (assignUserPayload?: AssignUserPayload) => {
  const assignUser = assignUserPayload?.assignUser ?? false;

  return SetMetadata<string, AuthTypeDecoratorPayload | null>(
    AUTH_TYPE_KEY,
    assignUser
      ? {
          authTypes: [AuthType.ASSIGN_USER],
          options: { condition: ConditionGuard.AND },
        }
      : null,
  );
};

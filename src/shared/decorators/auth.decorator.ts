import { SetMetadata } from '@nestjs/common';
import { AuthType, ConditionGuard } from '../constants/auth.constant';
import {
  AssignUserOptions,
  AuthDecoratorPayload,
  IsPublicDecoratorPayload,
} from '../types/auth.type';

export const AUTH_TYPE_KEY = 'authType';

export const Auth = (authDecoratorPayload?: AuthDecoratorPayload) =>
  SetMetadata<string, AuthDecoratorPayload>(
    AUTH_TYPE_KEY,
    authDecoratorPayload ?? {
      authTypes: [AuthType.BEARER],
      options: { condition: ConditionGuard.AND },
    },
  );

export const IsPublic = (assignUserOptions?: AssignUserOptions) => {
  const assignUser = assignUserOptions?.assignUser ?? false;

  return SetMetadata<string, IsPublicDecoratorPayload | null>(
    AUTH_TYPE_KEY,
    assignUser
      ? {
          authTypes: [AuthType.ASSIGN_USER],
          options: { condition: ConditionGuard.AND },
        }
      : null,
  );
};

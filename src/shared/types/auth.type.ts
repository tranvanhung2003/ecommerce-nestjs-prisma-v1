import { AuthType, ConditionGuard } from '../constants/auth.constant';

export type AuthTypeType = (typeof AuthType)[keyof typeof AuthType];

export type ConditionGuardType =
  (typeof ConditionGuard)[keyof typeof ConditionGuard];

export type AuthTypeDecoratorPayload = {
  authTypes: AuthTypeType[];
  options: { condition: ConditionGuardType };
};

import { AuthType, ConditionGuard } from '../constants/auth.constant';

export type AuthTypeType = (typeof AuthType)[keyof typeof AuthType];

export type ConditionGuardType =
  (typeof ConditionGuard)[keyof typeof ConditionGuard];

// ----------------------------------------------------------------------------------------------------

export interface AuthDecoratorPayload {
  authTypes: Exclude<AuthTypeType, AuthType['ASSIGN_USER']>[];
  options: { condition: ConditionGuardType };
}

export type IsPublicDecoratorPayload = {
  authTypes: [AuthType['ASSIGN_USER']];
  options: { condition: Extract<ConditionGuardType, ConditionGuard['AND']> };
};

export type AuthTypeDecoratorPayload =
  | AuthDecoratorPayload
  | IsPublicDecoratorPayload;

export interface AssignUserPayload {
  assignUser: boolean;
}

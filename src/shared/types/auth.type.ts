import { AuthType, ConditionGuard } from '../constants/auth.constant';

export type AuthTypeValue = (typeof AuthType)[keyof typeof AuthType];

export type ConditionGuardValue =
  (typeof ConditionGuard)[keyof typeof ConditionGuard];

// ----------------------------------------------------------------------------------------------------

export interface AuthDecoratorPayload {
  authTypes: Exclude<AuthTypeValue, AuthType['ASSIGN_USER']>[];
  options: { condition: ConditionGuardValue };
}

export type IsPublicDecoratorPayload = {
  authTypes: [AuthType['ASSIGN_USER']];
  options: { condition: Extract<ConditionGuardValue, ConditionGuard['AND']> };
};

export type CompositeAuthDecoratorPayload =
  | AuthDecoratorPayload
  | IsPublicDecoratorPayload;

export interface AssignUserOptions {
  assignUser: boolean;
}

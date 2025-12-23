export const REQUEST_USER_KEY = 'user';

export const AuthType = {
  BEARER: 'bearer',
  API_KEY: 'apiKey',
  ASSIGN_USER: 'assignUser',
} as const;

export type AuthType = typeof AuthType;

export const ConditionGuard = {
  AND: 'and',
  OR: 'or',
} as const;

export type ConditionGuard = typeof ConditionGuard;

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthType, ConditionGuard } from '../constants/auth.constant';
import { AUTH_TYPE_KEY } from '../decorators/auth.decorator';
import { isHttpException } from '../helpers/helpers';
import { AuthTypeDecoratorPayload } from '../types/auth.type';
import { AccessTokenGuard } from './access-token.guard';
import { ApiKeyGuard } from './api-key.guard';

interface BooleanCanActivate extends CanActivate {
  canActivate(context: ExecutionContext): true | Promise<true>;
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authGuardsMap: Record<string, BooleanCanActivate>;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {
    this.authGuardsMap = {
      [AuthType.BEARER]: this.accessTokenGuard,
      [AuthType.API_KEY]: this.apiKeyGuard,
      [AuthType.NONE]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.reflector.getAllAndOverride<
      AuthTypeDecoratorPayload | undefined,
      string
    >(AUTH_TYPE_KEY, [context.getHandler(), context.getClass()]);

    if (!authTypeValue) {
      return true;
    }

    const guards = authTypeValue.authTypes.map(
      (authType) => this.authGuardsMap[authType],
    );

    const promiseGuards: Promise<[boolean, string]>[] = guards.map(
      async (guard) => {
        try {
          const result = await guard.canActivate(context);

          return [result, ''] as [boolean, string];
        } catch (error) {
          if (isHttpException(error)) {
            return [false, error.message] as [boolean, string];
          } else {
            return [false, 'Unauthorized'] as [boolean, string];
          }
        }
      },
    );

    const results = await Promise.all(promiseGuards);

    const passedResults = results.map(([result]) => result);

    const errorMessages = results
      .map(([, errorMessage]) => errorMessage)
      .filter((msg) => msg !== '');

    const mergedErrorMessages =
      errorMessages.length > 0 ? errorMessages.join(', ') : 'Unauthorized';

    if (authTypeValue.options.condition === ConditionGuard.AND) {
      const allPassed = passedResults.every((result) => result);

      if (!allPassed) {
        throw new UnauthorizedException(mergedErrorMessages);
      }
    } else {
      const anyPassed = passedResults.some((result) => result);

      if (!anyPassed) {
        throw new UnauthorizedException(mergedErrorMessages);
      }
    }

    return true;
  }
}

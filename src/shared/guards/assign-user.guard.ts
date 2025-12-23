import { ExecutionContext, Injectable } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard';

@Injectable()
export class AssignUserGuard extends AccessTokenGuard {
  async canActivate(context: ExecutionContext): Promise<true> {
    try {
      return await super.canActivate(context);
    } catch {
      return true;
    }
  }
}

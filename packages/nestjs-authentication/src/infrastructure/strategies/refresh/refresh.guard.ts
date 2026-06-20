import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { GuardsPolicy } from '../../../domain/policies/guards.policy';
import { AuthGuard } from '../../auth.guard';

import { RefreshUnauthorizedException } from './exceptions/refresh-unauthorized.exception';
import { REFRESH_STRATEGY_NAME } from './refresh.constants';

@Injectable()
export class RefreshGuard extends AuthGuard(REFRESH_STRATEGY_NAME, {
  canDisable: false,
}) {
  constructor(guardsPolicy: GuardsPolicy, reflector: Reflector) {
    super(guardsPolicy, reflector);
  }

  handleRequest<T>(err: Error | undefined, user: T, info?: Error) {
    if (err || !user) {
      throw new RefreshUnauthorizedException({ originalError: err ?? info });
    }
    return user;
  }
}

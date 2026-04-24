import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ReferenceIdInterface } from '@concepta/nestjs-common';

import { GuardsPolicy } from '../../../domain/policies/guards.policy';
import { AuthGuard } from '../../auth.guard';

import { JwtUnauthorizedException } from './exceptions/jwt-unauthorized.exception';
import { JWT_STRATEGY_NAME } from './jwt.constants';

@Injectable()
export class JwtGuard extends AuthGuard(JWT_STRATEGY_NAME, {
  canDisable: true,
}) {
  constructor(guardsPolicy: GuardsPolicy, reflector: Reflector) {
    super(guardsPolicy, reflector);
  }

  handleRequest<T = ReferenceIdInterface>(
    err: Error | undefined,
    user: T,
    info?: Error,
  ) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw new JwtUnauthorizedException({ originalError: err ?? info });
    }
    return user;
  }
}

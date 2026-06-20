import { Inject, Injectable } from '@nestjs/common';

import { getAppContext } from '@concepta/nestjs-core';

import {
  AUTHENTICATION_JWT_PORT_TOKEN,
  AUTHENTICATION_USER_PORT_TOKEN,
} from '../../../authentication.constants';
import { AuthorizationPayloadInterface } from '../../../domain/interfaces/authorization-payload.interface';
import { RefreshStrategyPolicy } from '../../../domain/policies/refresh-strategy.policy';
import { JwtPort } from '../../../domain/ports/jwt.port';
import { UserPort } from '../../../domain/ports/user.port';
import { JwtPassportStrategy } from '../../passport/jwt-passport.strategy';
import { PassportStrategyFactory } from '../../passport/passport-strategy.factory';
import { createVerifyTokenCallback } from '../../passport/utils/create-verify-token-callback.util';

import { RefreshUnauthorizedException } from './exceptions/refresh-unauthorized.exception';
import { REFRESH_STRATEGY_NAME } from './refresh.constants';

@Injectable()
export class RefreshStrategy extends PassportStrategyFactory<JwtPassportStrategy>(
  JwtPassportStrategy,
  REFRESH_STRATEGY_NAME,
) {
  constructor(
    @Inject(RefreshStrategyPolicy)
    policy: RefreshStrategyPolicy,
    @Inject(AUTHENTICATION_JWT_PORT_TOKEN)
    jwtPort: JwtPort,
    @Inject(AUTHENTICATION_USER_PORT_TOKEN)
    private userPort: UserPort,
  ) {
    super({
      jwtFromRequest: policy.jwtFromRequest,
      verifyToken: createVerifyTokenCallback(jwtPort, 'refresh'),
    });
  }

  async validate(payload: AuthorizationPayloadInterface, req: unknown) {
    const user = await this.userPort.getBySubject(
      getAppContext(req),
      payload.sub,
    );

    if (!user) {
      throw new RefreshUnauthorizedException();
    }

    return user;
  }
}

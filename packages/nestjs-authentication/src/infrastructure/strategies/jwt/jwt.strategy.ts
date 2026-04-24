import { Inject, Injectable } from '@nestjs/common';

import { ReferenceIdInterface, getAppContext } from '@concepta/nestjs-common';

import {
  AUTHENTICATION_JWT_PORT_TOKEN,
  AUTHENTICATION_USER_PORT_TOKEN,
} from '../../../authentication.constants';
import { AuthorizationPayloadInterface } from '../../../domain/interfaces/authorization-payload.interface';
import { JwtStrategyPolicy } from '../../../domain/policies/jwt-strategy.policy';
import { JwtPort } from '../../../domain/ports/jwt.port';
import { UserPort } from '../../../domain/ports/user.port';
import { JwtPassportStrategy } from '../../passport/jwt-passport.strategy';
import { PassportStrategyFactory } from '../../passport/passport-strategy.factory';
import { createVerifyTokenCallback } from '../../passport/utils/create-verify-token-callback.util';

import { JwtUnauthorizedException } from './exceptions/jwt-unauthorized.exception';
import { JWT_STRATEGY_NAME } from './jwt.constants';

@Injectable()
export class JwtStrategy extends PassportStrategyFactory<JwtPassportStrategy>(
  JwtPassportStrategy,
  JWT_STRATEGY_NAME,
) {
  constructor(
    @Inject(JwtStrategyPolicy)
    policy: JwtStrategyPolicy,
    @Inject(AUTHENTICATION_JWT_PORT_TOKEN)
    jwtPort: JwtPort,
    @Inject(AUTHENTICATION_USER_PORT_TOKEN)
    private userPort: UserPort,
  ) {
    super({
      jwtFromRequest: policy.jwtFromRequest,
      verifyToken: createVerifyTokenCallback(jwtPort, 'access'),
    });
  }

  async validate(
    payload: AuthorizationPayloadInterface,
    req: unknown,
  ): Promise<ReferenceIdInterface> {
    const user = await this.userPort.getBySubject(
      getAppContext(req),
      payload.sub,
    );

    if (user) {
      return user;
    } else {
      throw new JwtUnauthorizedException();
    }
  }
}

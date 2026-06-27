import { type Provider } from '@nestjs/common';

import {
  AUTHENTICATION_JWT_PORT_TOKEN,
  AUTHENTICATION_USER_PORT_TOKEN,
} from '../../authentication.constants';
import { JwtStrategyPolicy } from '../../domain/policies/jwt-strategy.policy';
import { JwtPolicy } from '../../domain/policies/jwt.policy';
import { type JwtPort } from '../../domain/ports/jwt.port';
import { type UserPort } from '../../domain/ports/user.port';
import { type AuthenticationOptionsInterface } from '../config/interfaces/authentication-options.interface';
import { AuthenticationFeatureConfigException } from '../exceptions/authentication-feature-config.exception';
import { JwtStrategy } from '../strategies/jwt/jwt.strategy';

export function createJwtStrategyProvider(rawOptionsToken: symbol): Provider {
  return {
    provide: JwtStrategy,
    inject: [
      rawOptionsToken,
      JwtStrategyPolicy,
      JwtPolicy,
      AUTHENTICATION_JWT_PORT_TOKEN,
      { token: AUTHENTICATION_USER_PORT_TOKEN, optional: true },
    ],
    useFactory: (
      options: AuthenticationOptionsInterface,
      jwtStrategyPolicy: JwtStrategyPolicy,
      jwtPolicy: JwtPolicy,
      jwtPort: JwtPort,
      userPort: UserPort | null,
    ) => {
      if (!options.settings?.strategies?.jwt) return null;
      if (!options.settings?.jwt) {
        throw new AuthenticationFeatureConfigException('jwt strategy', [
          'jwt token config',
        ]);
      }
      if (!userPort) {
        throw new AuthenticationFeatureConfigException('jwt strategy', [
          'UserPort',
        ]);
      }
      // jwtPolicy validates the jwt token config is properly wired
      void jwtPolicy;
      return new JwtStrategy(jwtStrategyPolicy, jwtPort, userPort);
    },
  };
}

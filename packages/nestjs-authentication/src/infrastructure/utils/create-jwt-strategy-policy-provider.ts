import { Provider } from '@nestjs/common';

import { JwtStrategyPolicy } from '../../domain/policies/jwt-strategy.policy';
import {
  authenticationDefaultConfig,
  AuthenticationModuleDefaultsInterface,
} from '../config/authentication-default.config';
import { AuthenticationOptionsInterface } from '../config/interfaces/authentication-options.interface';

export function createJwtStrategyPolicyProvider(
  rawOptionsToken: symbol,
): Provider {
  return {
    provide: JwtStrategyPolicy,
    inject: [rawOptionsToken, authenticationDefaultConfig.KEY],
    useFactory: (
      options: AuthenticationOptionsInterface,
      defaults: AuthenticationModuleDefaultsInterface,
    ) =>
      new JwtStrategyPolicy({
        ...defaults.strategies.jwt,
        ...(options.settings?.strategies?.jwt ?? {}),
      }),
  };
}

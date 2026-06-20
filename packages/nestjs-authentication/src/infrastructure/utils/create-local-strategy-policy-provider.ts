import { Provider } from '@nestjs/common';

import { LocalStrategyPolicy } from '../../domain/policies/local-strategy.policy';
import {
  authenticationDefaultConfig,
  AuthenticationModuleDefaultsInterface,
} from '../config/authentication-default.config';
import { AuthenticationOptionsInterface } from '../config/interfaces/authentication-options.interface';

export function createLocalStrategyPolicyProvider(
  rawOptionsToken: symbol,
): Provider {
  return {
    provide: LocalStrategyPolicy,
    inject: [rawOptionsToken, authenticationDefaultConfig.KEY],
    useFactory: (
      options: AuthenticationOptionsInterface,
      defaults: AuthenticationModuleDefaultsInterface,
    ) =>
      new LocalStrategyPolicy({
        ...defaults.strategies.local,
        ...(options.settings?.strategies?.local ?? {}),
      }),
  };
}

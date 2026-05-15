import { Provider } from '@nestjs/common';

import { GuardsPolicy } from '../../domain/policies/guards.policy';
import { AuthenticationOptionsInterface } from '../config/interfaces/authentication-options.interface';

export function createGuardsPolicyProvider(rawOptionsToken: symbol): Provider {
  return {
    provide: GuardsPolicy,
    inject: [rawOptionsToken],
    useFactory: (options: AuthenticationOptionsInterface) =>
      new GuardsPolicy(options.settings?.guards),
  };
}

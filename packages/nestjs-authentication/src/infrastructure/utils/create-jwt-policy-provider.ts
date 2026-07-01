import { type Provider } from '@nestjs/common';

import { JwtPolicy } from '../../domain/policies/jwt.policy';
import { type AuthenticationOptionsInterface } from '../config/interfaces/authentication-options.interface';

export function createJwtPolicyProvider(rawOptionsToken: symbol): Provider {
  return {
    provide: JwtPolicy,
    inject: [rawOptionsToken],
    useFactory: (options: AuthenticationOptionsInterface) =>
      new JwtPolicy(options.settings?.jwt ?? {}),
  };
}

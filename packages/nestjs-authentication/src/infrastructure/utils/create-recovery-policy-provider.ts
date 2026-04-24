import { Provider } from '@nestjs/common';

import { RecoveryPolicy } from '../../domain/policies/recovery.policy';
import {
  authenticationDefaultConfig,
  AuthenticationModuleDefaultsInterface,
} from '../config/authentication-default.config';
import { AuthenticationOptionsInterface } from '../config/interfaces/authentication-options.interface';

export function createRecoveryPolicyProvider(
  rawOptionsToken: symbol,
): Provider {
  return {
    provide: RecoveryPolicy,
    inject: [rawOptionsToken, authenticationDefaultConfig.KEY],
    useFactory: (
      options: AuthenticationOptionsInterface,
      defaults: AuthenticationModuleDefaultsInterface,
    ) =>
      new RecoveryPolicy({
        ...defaults.mfa.recovery,
        ...(options.settings?.mfa?.recovery ?? {}),
      }),
  };
}

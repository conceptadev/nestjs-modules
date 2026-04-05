import { Provider } from '@nestjs/common';

import { PasswordPolicy } from '../../domain/policies/password.policy';
import { PASSWORD_MODULE_SETTINGS_TOKEN } from '../../password.constants';
import { PasswordSettingsInterface } from '../config/interfaces/password-settings.interface';

export function createPasswordPolicyProvider(): Provider {
  return {
    provide: PasswordPolicy,
    inject: [PASSWORD_MODULE_SETTINGS_TOKEN],
    useFactory: (settings: PasswordSettingsInterface) =>
      new PasswordPolicy(settings),
  };
}

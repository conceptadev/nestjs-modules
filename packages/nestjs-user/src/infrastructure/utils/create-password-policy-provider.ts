import { Provider } from '@nestjs/common';

import { UserPasswordPolicy } from '../../domain/policies/user-password.policy';
import { USER_MODULE_SETTINGS_TOKEN } from '../../user.constants';
import { UserSettingsInterface } from '../config/interfaces/user-settings.interface';

export function createPasswordPolicyProvider(): Provider {
  return {
    provide: UserPasswordPolicy,
    inject: [USER_MODULE_SETTINGS_TOKEN],
    useFactory: (settings: UserSettingsInterface) => {
      return new UserPasswordPolicy(settings?.password);
    },
  };
}

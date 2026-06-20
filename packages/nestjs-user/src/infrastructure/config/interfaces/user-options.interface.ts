import { UserPasswordPortSettings } from '../../../domain/ports/user-password.port';

import { UserSettingsInterface } from './user-settings.interface';

export interface UserOptionsInterface {
  settings?: UserSettingsInterface;
  ports?: {
    password?: UserPasswordPortSettings;
  };
}

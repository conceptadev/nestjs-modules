import { type UserPasswordPortSettings } from '../../../domain/ports/user-password.port';

import { type UserSettingsInterface } from './user-settings.interface';

export interface UserOptionsInterface {
  settings?: UserSettingsInterface;
  ports?: {
    password?: UserPasswordPortSettings;
  };
}

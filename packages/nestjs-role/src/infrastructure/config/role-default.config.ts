import { registerAs } from '@nestjs/config';

import { type RoleSettingsInterface } from './interfaces/role-settings.interface.js';

const ROLE_MODULE_DEFAULT_SETTINGS_TOKEN = 'ROLE_MODULE_DEFAULT_SETTINGS_TOKEN';

/**
 * Default configuration for Role module.
 */
export const roleDefaultConfig = registerAs(
  ROLE_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): Partial<RoleSettingsInterface> => ({}),
);

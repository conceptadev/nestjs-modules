import { registerAs } from '@nestjs/config';

import { ACCESS_CONTROL_MODULE_DEFAULT_SETTINGS_TOKEN } from '../../access-control.constants';

import { type AccessControlSettingsInterface } from './interfaces/access-control-settings.interface';

/**
 * Default configuration for access control.
 */
export const accessControlDefaultConfig = registerAs(
  ACCESS_CONTROL_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): Partial<AccessControlSettingsInterface> => ({}),
);

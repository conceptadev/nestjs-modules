import { registerAs } from '@nestjs/config';

import { CACHE_MODULE_DEFAULT_SETTINGS_TOKEN } from '../../cache.constants';

import { type CacheSettingsInterface } from './interfaces/cache-settings.interface';

/**
 * Default configuration for Cache module.
 */
export const cacheDefaultConfig = registerAs(
  CACHE_MODULE_DEFAULT_SETTINGS_TOKEN,
  (): Partial<CacheSettingsInterface> => ({
    expiresIn: process.env.CACHE_EXPIRE_IN ?? null,
  }),
);

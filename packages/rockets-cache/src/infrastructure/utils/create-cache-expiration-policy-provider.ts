import { Provider } from '@nestjs/common';

import { CACHE_MODULE_SETTINGS_TOKEN } from '../../cache.constants';
import { CacheExpirationPolicy } from '../../domain/policies/cache-expiration.policy';
import { CacheSettingsInterface } from '../config/interfaces/cache-settings.interface';

export function createCacheExpirationPolicyProvider(): Provider {
  return {
    provide: CacheExpirationPolicy,
    inject: [CACHE_MODULE_SETTINGS_TOKEN],
    useFactory: (settings: CacheSettingsInterface) =>
      new CacheExpirationPolicy(settings),
  };
}

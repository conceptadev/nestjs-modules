import { Provider } from '@nestjs/common';

import {
  CacheInterface,
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-common';

import { CACHE_MODULE_SETTINGS_TOKEN } from '../../cache.constants';
import { CacheSettingsInterface } from '../config/interfaces/cache-settings.interface';
import { CacheRepository } from '../persistence/cache.repository';

export function getDynamicCacheRepositoryToken(entityKey: string): string {
  return `CACHE_REPOSITORY_${entityKey.toUpperCase()}`;
}

export function createCacheRepositoryProvider(entityKey: string): Provider {
  return {
    provide: getDynamicCacheRepositoryToken(entityKey),
    inject: [getDynamicRepositoryToken(entityKey), CACHE_MODULE_SETTINGS_TOKEN],
    useFactory: (
      repository: RepositoryInterface<CacheInterface>,
      settings: CacheSettingsInterface,
    ) => {
      return new CacheRepository(repository, settings);
    },
  };
}

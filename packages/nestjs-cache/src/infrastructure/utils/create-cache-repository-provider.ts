import { Provider, Type } from '@nestjs/common';

import {
  CacheInterface,
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/nestjs-common';

import {
  CACHE_CUSTOM_REPOSITORY_TOKEN,
  CACHE_MODULE_SETTINGS_TOKEN,
} from '../../cache.constants';
import { CacheRepositoryInterface } from '../../domain/repositories/cache-repository.interface';
import { CacheSettingsInterface } from '../config/interfaces/cache-settings.interface';
import { CacheRepository } from '../persistence/cache.repository';

export function getDynamicCacheRepositoryToken(entityKey: string): string {
  return `CACHE_REPOSITORY_${entityKey.toUpperCase()}`;
}

export function createCacheRepositoryProvider(entityKey: string): Provider {
  return {
    provide: getDynamicCacheRepositoryToken(entityKey),
    inject: [
      getDynamicRepositoryToken(entityKey),
      CACHE_MODULE_SETTINGS_TOKEN,
      { token: CACHE_CUSTOM_REPOSITORY_TOKEN, optional: true },
    ],
    useFactory: (
      repository: RepositoryInterface<CacheInterface>,
      settings: CacheSettingsInterface,
      customRepo?: Type<CacheRepositoryInterface>,
    ) => {
      const RepoClass = customRepo ?? CacheRepository;
      return new RepoClass(repository, settings);
    },
  };
}

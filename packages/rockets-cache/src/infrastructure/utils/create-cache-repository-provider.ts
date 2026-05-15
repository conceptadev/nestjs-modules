import { Provider, Type } from '@nestjs/common';

import {
  getDynamicRepositoryToken,
  RepositoryInterface,
} from '@concepta/rockets-repository';

import { CACHE_CUSTOM_REPOSITORY_TOKEN } from '../../cache.constants';
import { CacheRepositoryInterface } from '../../domain/repositories/cache-repository.interface';
import { CacheMapper } from '../persistence/cache.mapper';
import { CacheRepository } from '../persistence/cache.repository';
import { CacheEntityInterface } from '../persistence/interfaces/cache-entity.interface';

export function getDynamicCacheRepositoryToken(entityKey: string): string {
  return `CACHE_REPOSITORY_${entityKey.toUpperCase()}`;
}

export function createCacheRepositoryProvider(entityKey: string): Provider {
  return {
    provide: getDynamicCacheRepositoryToken(entityKey),
    inject: [
      getDynamicRepositoryToken(entityKey),
      CacheMapper,
      { token: CACHE_CUSTOM_REPOSITORY_TOKEN, optional: true },
    ],
    useFactory: (
      repository: RepositoryInterface<CacheEntityInterface>,
      mapper: CacheMapper,
      customRepo?: Type<CacheRepositoryInterface>,
    ) => {
      const RepoClass = customRepo ?? CacheRepository;
      return new RepoClass(repository, mapper);
    },
  };
}

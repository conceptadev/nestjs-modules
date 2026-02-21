import { getDynamicRepositoryToken } from '@concepta/nestjs-common';

import { CACHE_MODULE_SETTINGS_TOKEN } from '../../../cache.constants';
import { CacheRepository } from '../../persistence/cache.repository';
import {
  createCacheRepositoryProvider,
  getDynamicCacheRepositoryToken,
} from '../create-cache-repository-provider';

describe('getDynamicCacheRepositoryToken', () => {
  it('should return uppercase token with prefix', () => {
    expect(getDynamicCacheRepositoryToken('user')).toBe(
      'CACHE_REPOSITORY_USER',
    );
  });

  it('should handle mixed case', () => {
    expect(getDynamicCacheRepositoryToken('UserCache')).toBe(
      'CACHE_REPOSITORY_USERCACHE',
    );
  });
});

describe('createCacheRepositoryProvider', () => {
  it('should create a provider with correct token', () => {
    const provider = createCacheRepositoryProvider('user');

    expect(provider).toEqual(
      expect.objectContaining({
        provide: 'CACHE_REPOSITORY_USER',
      }),
    );
  });

  it('should inject repository token and settings token', () => {
    const provider = createCacheRepositoryProvider('user') as {
      inject: unknown[];
    };

    expect(provider.inject).toEqual([
      getDynamicRepositoryToken('user'),
      CACHE_MODULE_SETTINGS_TOKEN,
    ]);
  });

  it('should have a useFactory that returns CacheRepository', () => {
    const provider = createCacheRepositoryProvider('user') as {
      useFactory: (...args: unknown[]) => unknown;
    };

    const mockRepo = {} as never;
    const mockSettings = {};
    const result = provider.useFactory(mockRepo, mockSettings);

    expect(result).toBeInstanceOf(CacheRepository);
  });
});

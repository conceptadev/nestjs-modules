import {
  CacheCoreAsyncOptions,
  CacheCoreOptions,
} from './cache-core.module-definition';

export type CacheOptions = Omit<CacheCoreOptions, 'global'>;
export type CacheAsyncOptions = Omit<CacheCoreAsyncOptions, 'global'>;

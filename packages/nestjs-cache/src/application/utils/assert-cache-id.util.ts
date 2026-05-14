import { isString } from 'class-validator';

import { ReferenceId } from '@concepta/rockets-app';

import { CacheException } from '../../domain/exceptions/cache.exception';

export function assertCacheId(value: unknown): asserts value is ReferenceId {
  if (!isString(value) || value.trim() === '') {
    throw new CacheException({
      message: 'Expected cache id to be a non-empty string, got %s',
      messageParams: [typeof value],
    });
  }
}

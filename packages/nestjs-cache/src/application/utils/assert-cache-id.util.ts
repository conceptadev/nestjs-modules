import { type ReferenceId } from '@concepta/nestjs-core';

import { CacheException } from '../../domain/exceptions/cache.exception.js';

export function assertCacheId(value: unknown): asserts value is ReferenceId {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new CacheException({
      message: 'Expected cache id to be a non-empty string, got %s',
      messageParams: [typeof value],
      fault: 'client',
    });
  }
}

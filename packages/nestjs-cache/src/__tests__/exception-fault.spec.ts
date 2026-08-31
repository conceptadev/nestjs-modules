import {
  type RuntimeException,
  type RuntimeExceptionFault,
} from '@concepta/nestjs-core';

import { CacheNotFoundException } from '../application/exceptions/cache-not-found.exception.js';
import { CacheInvalidExpiredDateException } from '../domain/exceptions/cache-invalid-expired-date.exception.js';
import { CacheException } from '../domain/exceptions/cache.exception.js';
import { CacheEntityNotFoundException } from '../infrastructure/exceptions/cache-entity-not-found.exception.js';

/**
 * Anti-drift check: every `RuntimeException` subclass in this package states
 * an expected `fault` here.
 */
const CASES: {
  name: string;
  build: () => RuntimeException;
  fault: RuntimeExceptionFault;
}[] = [
  {
    name: 'CacheException (default)',
    build: () => new CacheException(),
    fault: 'internal',
  },
  {
    name: 'CacheInvalidExpiredDateException',
    build: () => new CacheInvalidExpiredDateException(),
    fault: 'client',
  },
  {
    name: 'CacheNotFoundException',
    build: () => new CacheNotFoundException('id'),
    fault: 'client',
  },
  {
    name: 'CacheEntityNotFoundException',
    build: () => new CacheEntityNotFoundException('SomeEntity'),
    fault: 'usage',
  },
];

describe('exception fault classification', () => {
  it.each(CASES)('$name has fault=$fault', ({ build, fault }) => {
    expect(build().fault).toEqual(fault);
  });
});

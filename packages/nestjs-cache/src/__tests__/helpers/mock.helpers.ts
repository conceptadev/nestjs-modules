import {
  createMockCommandBus,
  createMockContext as createMockContextBase,
  createMockEventContext as createMockEventContextBase,
  createMockEventPublisher,
} from '@concepta/nestjs-common/testing';
import { createMockTransaction } from '@concepta/nestjs-repository/testing';

import { Cache } from '../../domain/aggregates/cache';
import { CacheRepositoryResolver } from '../../infrastructure/persistence/cache-repository.resolver';
import { CacheMapper } from '../../infrastructure/persistence/cache.mapper';
import { CacheRepository } from '../../infrastructure/persistence/cache.repository';
import { CacheEntityInterface } from '../../infrastructure/persistence/interfaces/cache-entity.interface';

export {
  createMockCommandBus,
  createMockEventPublisher,
  createMockTransaction,
};
export type { MockTransactionHandle } from '@concepta/nestjs-repository/testing';

export function createMockCacheRepository(): jest.Mocked<CacheRepository> {
  return {
    get: jest.fn(),
    findOne: jest.fn(),
    findAllByAssignee: jest.fn(),
    removeAllByAssignee: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
  } as unknown as jest.Mocked<CacheRepository>;
}

export function createMockRepositoryResolver(
  repo: CacheRepository,
): jest.Mocked<CacheRepositoryResolver> {
  return {
    resolve: jest.fn().mockReturnValue(repo),
  } as unknown as jest.Mocked<CacheRepositoryResolver>;
}

export function createMockContext(entity = 'UserCache') {
  return createMockContextBase(entity);
}

export function createMockEventContext(entity = 'UserCache') {
  return createMockEventContextBase(entity);
}

export function createMockCacheEntity(
  overrides: Partial<CacheEntityInterface> = {},
): CacheEntityInterface {
  return {
    id: 'test-id',
    key: 'test-key',
    type: 'test-type',
    assigneeId: 'test-assignee',
    data: 'test-data',
    expirationDate: new Date('2027-01-01'),
    dateCreated: new Date('2026-01-01'),
    dateUpdated: new Date('2026-01-01'),
    dateDeleted: null,
    version: 1,
    ...overrides,
  };
}

const cacheMapper = new CacheMapper();

export function toCacheDomain(entity: CacheEntityInterface): Cache {
  return cacheMapper.toDomain(entity);
}

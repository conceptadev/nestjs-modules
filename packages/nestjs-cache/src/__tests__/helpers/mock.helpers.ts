import {
  EntityHeaderInterface,
  EventContextHost,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

import { Cache } from '../../domain/aggregates/cache';
import { CacheRepositoryResolver } from '../../infrastructure/persistence/cache-repository.resolver';
import { CacheMapper } from '../../infrastructure/persistence/cache.mapper';
import { CacheRepository } from '../../infrastructure/persistence/cache.repository';
import { CacheEntityInterface } from '../../infrastructure/persistence/interfaces/cache-entity.interface';

export interface MockTransactionHandle {
  onCommit: jest.Mock;
  onRollback: jest.Mock;
}

export function createMockCacheRepository(): jest.Mocked<CacheRepository> {
  return {
    get: jest.fn(),
    findById: jest.fn(),
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

export function createMockTransaction(): {
  transaction: { run: jest.Mock };
  trxHandle: MockTransactionHandle;
} {
  const trxHandle: MockTransactionHandle = {
    onCommit: jest.fn(),
    onRollback: jest.fn(),
  };

  const transaction = {
    run: jest.fn((_ctx: unknown, fn: (trx: MockTransactionHandle) => unknown) =>
      fn(trxHandle),
    ),
  };

  return { transaction, trxHandle };
}

export function createMockEventPublisher() {
  return {
    mergeObjectContext: jest.fn((obj: unknown) => obj),
  };
}

export function createMockCommandBus() {
  return {
    execute: jest.fn(),
  };
}

export function createMockContext(
  entity = 'UserCache',
): RepositoryContextInterface {
  return { entity } as RepositoryContextInterface;
}

export function createMockEventContext(
  entity = 'UserCache',
): EventContextHost<EntityHeaderInterface> {
  return EventContextHost.builder<EntityHeaderInterface>()
    .setHeader('entity', entity)
    .build();
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

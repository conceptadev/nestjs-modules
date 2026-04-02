import {
  ActionEnum,
  AppContextHost,
  EventContextHost,
  Operation,
} from '@concepta/nestjs-common';
import {
  createMockCommandBus,
  createMockEventPublisher,
} from '@concepta/nestjs-common/testing';
import { CrudContextInterface, CrudCtx } from '@concepta/nestjs-crud';
import { createMockTransaction } from '@concepta/nestjs-repository/testing';

import { Cache } from '../../domain/aggregates/cache';
import { CacheCtx } from '../../gateways/cache-context.overlay';
import { CacheRepositoryResolver } from '../../infrastructure/persistence/cache-repository.resolver';
import { CacheMapper } from '../../infrastructure/persistence/cache.mapper';
import { CacheRepository } from '../../infrastructure/persistence/cache.repository';
import { CacheEntityInterface } from '../../infrastructure/persistence/interfaces/cache-entity.interface';

export const DEFAULT_CACHE_NAMESPACE = 'UserCache';

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

export function createMockEventContext(namespace = DEFAULT_CACHE_NAMESPACE) {
  return new EventContextHost({ namespace }, {});
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

export function createMockCacheContext(
  crudOverrides: Partial<CrudContextInterface> = {},
  namespace = DEFAULT_CACHE_NAMESPACE,
) {
  const ctx = new AppContextHost();

  ctx.defineOverlay(CrudCtx, {
    entity: crudOverrides.entity ?? 'UserCache',
    params: crudOverrides.params ?? {},
    query: crudOverrides.query ?? {},
    options: crudOverrides.options ?? {},
    operation: crudOverrides.operation ?? Operation.Read,
    action: crudOverrides.action ?? ActionEnum.READ,
  });

  ctx.defineOverlay(CacheCtx, { namespace });

  // Return the resolved CRUD child — has CRUD props (own)
  // and withCache() inherited via prototype chain.
  return ctx.require(CrudCtx, CacheCtx).withCrud();
}

const cacheMapper = new CacheMapper();

export function toCacheDomain(entity: CacheEntityInterface): Cache {
  return cacheMapper.toDomain(entity);
}

import { PlainLiteralObject } from '@nestjs/common';

import { RepositoryInterface } from '../repository/interfaces/repository.interface';

/**
 * Create a Jest-mocked RepositoryInterface for unit testing.
 *
 * All methods are `jest.fn()` stubs. Override individual mocks
 * as needed in your test setup.
 *
 * @param metadataOverrides - Optional overrides for repository metadata
 */
export function createMockRepository<
  Entity extends PlainLiteralObject = PlainLiteralObject,
>(
  metadataOverrides: Partial<RepositoryInterface<Entity>['metadata']> = {},
): jest.Mocked<RepositoryInterface<Entity>> {
  return {
    metadata: {
      name: 'MockEntity',
      type: class {} as never,
      columns: [],
      ...metadataOverrides,
    },
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    replace: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    transform: jest.fn(),
    merge: jest.fn(),
    prepare: jest.fn(),
  };
}

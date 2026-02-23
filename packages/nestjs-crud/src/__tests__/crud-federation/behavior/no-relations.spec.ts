import { Where } from '@concepta/nestjs-common';

import { createPaginatedResponse } from '../fixtures/crud-federation-mock-helpers';
import {
  assertHandlerCallCounts,
  assertNoRelationHandlerCalls,
  assertRootListQuery,
  assertResultStructure,
  assertEmptyResult,
  assertSortOrder,
} from '../fixtures/crud-federation-test-assertions';
import {
  createMinimalRootRelationSet,
  createSortDataSet,
} from '../fixtures/crud-federation-test-data';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../fixtures/crud-federation-test-setup';

/**
 * Behavior tests for queries without any relation relationships
 * Verifies that root-only queries pass through unchanged
 */
describe('CrudFederationService - Behavior: No Relations Query', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  it('should pass through root request unchanged when no relations exist', async () => {
    // ARRANGE
    const req = await mocks.createTestQuery({});
    const data = createMinimalRootRelationSet();

    mocks.rootListSpy.mockResolvedValue(
      createPaginatedResponse(data.roots, { limit: 10, total: 3 }),
    );

    // ACT
    const result = await mocks.service.list(req);

    // ASSERT
    assertHandlerCallCounts([
      { handler: mocks.rootListSpy, count: 1 },
      { handler: mocks.relationListSpy, count: 0 },
    ]);
    assertNoRelationHandlerCalls(mocks.relationListSpy);
    assertRootListQuery(mocks.rootListSpy, {});
    assertResultStructure(result, { count: 3, total: 3 });
  });

  it('should preserve root filters when no relations exist', async () => {
    // ARRANGE - Use interceptor to properly transform filters to search
    const req = await mocks.createTestQuery({ filter: ['name||$eq||test'] });
    const filteredRoots = [{ id: 1, name: 'test' }];

    mocks.rootListSpy.mockResolvedValue(
      createPaginatedResponse(filteredRoots, { limit: 10, total: 1 }),
    );

    // ACT
    const result = await mocks.service.list(req);

    // ASSERT
    assertHandlerCallCounts([
      { handler: mocks.rootListSpy, count: 1 },
      { handler: mocks.relationListSpy, count: 0 },
    ]);
    assertNoRelationHandlerCalls(mocks.relationListSpy);
    assertRootListQuery(mocks.rootListSpy, {
      filter: [Where.eq('name', 'test')],
    });
    assertResultStructure(result, { count: 1, total: 1 });
    expect(result.data[0]).toEqual({ id: 1, name: 'test' });
  });

  it('should preserve root sorting when no relations exist', async () => {
    // ARRANGE
    const req = await mocks.createTestQuery({ sort: ['name,ASC'] });
    const data = createSortDataSet();

    mocks.rootListSpy.mockResolvedValue(
      createPaginatedResponse(data.rootsByName, { limit: 10, total: 3 }),
    );

    // ACT
    const result = await mocks.service.list(req);

    // ASSERT
    assertHandlerCallCounts([
      { handler: mocks.rootListSpy, count: 1 },
      { handler: mocks.relationListSpy, count: 0 },
    ]);
    assertNoRelationHandlerCalls(mocks.relationListSpy);
    assertRootListQuery(mocks.rootListSpy, {
      sort: [{ field: 'name', order: 'ASC' }],
    });
    assertResultStructure(result, { count: 3, total: 3 });
    assertSortOrder(result, [3, 1, 2]);
  });

  it('should handle empty root results with no relations', async () => {
    // ARRANGE
    const req = await mocks.createTestQuery({});

    mocks.rootListSpy.mockResolvedValue(
      createPaginatedResponse([], { limit: 10, total: 0 }),
    );

    // ACT
    const result = await mocks.service.list(req);

    // ASSERT
    assertHandlerCallCounts([
      { handler: mocks.rootListSpy, count: 1 },
      { handler: mocks.relationListSpy, count: 0 },
    ]);
    assertNoRelationHandlerCalls(mocks.relationListSpy);
    assertRootListQuery(mocks.rootListSpy, {});
    assertEmptyResult(result);
  });
});

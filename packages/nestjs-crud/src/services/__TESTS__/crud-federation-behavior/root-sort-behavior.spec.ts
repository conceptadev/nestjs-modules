import { Where } from '@concepta/nestjs-common';

import { createPaginatedResponse } from '../../__FIXTURES__/crud-federation-mock-helpers';
import {
  assertHandlerCallCounts,
  assertRootFirst,
  assertLeftJoinBehavior,
  assertRootListQuery,
  assertResultStructure,
  assertEnrichment,
  assertSortOrder,
  assertRelationQuery,
} from '../../__FIXTURES__/crud-federation-test-assertions';
import {
  createNameSortDataSet,
  createIdDescSortDataSet,
  createMultiSortDataSet,
} from '../../__FIXTURES__/crud-federation-test-data';
import { createOneToManyForwardRelation } from '../../__FIXTURES__/crud-federation-test-entities';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../../__FIXTURES__/crud-federation-test-setup';

/**
 * Behavior tests for root sort strategy (LEFT JOIN compatible)
 * Root sort allows LEFT JOIN behavior - all roots returned, sorted by root field
 * No constraint validation needed for root sorts
 */
describe('CrudFederationService - Behavior: Root Sort Strategy', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  describe('Single root field sort', () => {
    it('should sort roots by name with LEFT JOIN behavior', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery(
        {
          page: '1',
          limit: '10',
          sort: ['name,ASC'],
        },
        [relation],
      );

      const data = createNameSortDataSet();

      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.roots, { limit: 10, total: 3 }),
      );
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(data.relations, { total: 2 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 1 },
      ]);
      assertRootFirst(mocks.rootListSpy, [mocks.relationListSpy]);
      assertLeftJoinBehavior(mocks.rootListSpy);

      // Verify root handler called with sort parameters
      assertRootListQuery(mocks.rootListSpy, {
        sort: [{ field: 'name', order: 'ASC' }],
        page: 1,
        limit: 10,
      });

      // Verify relation handler called with all root IDs for enrichment
      assertRelationQuery(mocks.relationListSpy, {
        filter: [{ ...Where.in('rootId', [1, 3, 2]), relation: 'relations' }],
      });

      // ASSERT - Result verification
      assertResultStructure(result, { count: 3, total: 3 });
      assertSortOrder(result, [1, 3, 2]); // Root A, Root B, Root C by name ASC
      assertEnrichment(result, 'relations', {
        1: [{ id: 1, rootId: 1, title: 'Relation 1' }],
        2: [], // No relations
        3: [{ id: 2, rootId: 3, title: 'Relation 2' }],
      });
    });

    it('should sort roots by id descending with LEFT JOIN behavior', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery(
        {
          page: '1',
          limit: '5',
          sort: 'id,DESC',
        },
        [relation],
      );

      const data = createIdDescSortDataSet();

      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.roots, { limit: 5, total: 5 }),
      );
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(data.relations, { total: 3 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 1 },
      ]);
      assertRootFirst(mocks.rootListSpy, [mocks.relationListSpy]);
      assertLeftJoinBehavior(mocks.rootListSpy);

      // Verify root handler called with descending sort parameters
      assertRootListQuery(mocks.rootListSpy, {
        sort: [{ field: 'id', order: 'DESC' }],
        page: 1,
        limit: 5,
      });

      // Verify relation handler called with all root IDs for enrichment
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          { ...Where.in('rootId', [3, 4, 5, 2, 1]), relation: 'relations' },
        ],
      });

      // ASSERT - Result verification
      assertResultStructure(result, { count: 5, total: 5 });
      assertSortOrder(result, [3, 4, 5, 2, 1]); // As returned by mock (already sorted DESC)
      assertEnrichment(result, 'relations', {
        1: [], // No relations
        2: [{ id: 1, rootId: 2, title: 'Relation 1' }],
        3: [], // No relations
        4: [
          { id: 2, rootId: 4, title: 'Relation 2' },
          { id: 3, rootId: 4, title: 'Relation 3' },
        ],
        5: [], // No relations
      });
    });
  });

  describe('Multiple root field sorts', () => {
    it('should sort roots by multiple fields with LEFT JOIN behavior', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery(
        {
          page: '1',
          limit: '10',
          sort: ['name,ASC', 'id,DESC'],
        },
        [relation],
      );

      const data = createMultiSortDataSet();

      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.roots, { limit: 10, total: 3 }),
      );
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(data.relations, { total: 3 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 1 },
      ]);
      assertRootFirst(mocks.rootListSpy, [mocks.relationListSpy]);
      assertLeftJoinBehavior(mocks.rootListSpy);

      // Verify root handler called with multi-field sort parameters
      assertRootListQuery(mocks.rootListSpy, {
        sort: [
          { field: 'name', order: 'ASC' },
          { field: 'id', order: 'DESC' },
        ],
        page: 1,
        limit: 10,
      });

      // Verify relation handler called with all root IDs for enrichment
      assertRelationQuery(mocks.relationListSpy, {
        filter: [{ ...Where.in('rootId', [3, 1, 2]), relation: 'relations' }],
      });

      // ASSERT - Result verification
      assertResultStructure(result, { count: 3, total: 3 });
      assertSortOrder(result, [3, 1, 2]); // Root A (id:3), Root A (id:1), Root B (id:2)
      assertEnrichment(result, 'relations', {
        1: [
          { id: 1, rootId: 1, title: 'Relation 1' },
          { id: 2, rootId: 1, title: 'Relation 2' },
        ],
        2: [], // No relations
        3: [{ id: 3, rootId: 3, title: 'Relation 3' }],
      });
    });
  });
});

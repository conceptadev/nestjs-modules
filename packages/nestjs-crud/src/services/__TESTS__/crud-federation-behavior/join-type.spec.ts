import { Where, WhereOperator } from '@concepta/nestjs-common';

import { createPaginatedResponse } from '../../__FIXTURES__/crud-federation-mock-helpers';
import {
  assertHandlerCallCounts,
  assertInnerJoinBehavior,
  assertLeftJoinBehavior,
  assertResultStructure,
  assertEnrichment,
  assertRelationQuery,
} from '../../__FIXTURES__/crud-federation-test-assertions';
import { createMinimalRootRelationSet } from '../../__FIXTURES__/crud-federation-test-data';
import { createOneToManyForwardRelation } from '../../__FIXTURES__/crud-federation-test-entities';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../../__FIXTURES__/crud-federation-test-setup';

/**
 * Tests for join type behavior (LEFT vs INNER) for forward relations
 * Tests automatic $nnull filter injection for INNER join relations
 */
describe('CrudFederationService - Behavior: Join Type (Forward Relations)', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  describe('Forward relationships (one-to-many)', () => {
    it('should use LEFT JOIN by default (no join property specified)', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      // No join property specified - should default to LEFT JOIN
      const req = await mocks.createTestQuery({ page: '1', limit: '10' }, [
        relation,
      ]);

      const data = createMinimalRootRelationSet();
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.roots, { limit: 10, total: 3 }),
      );
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(data.relations, { total: 3 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Should use LEFT JOIN behavior (root-first, no search constraints)
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 1 },
      ]);
      assertLeftJoinBehavior(mocks.rootListSpy);
      assertResultStructure(result, { count: 3, total: 3 });

      // Verify all roots returned (LEFT JOIN behavior)
      expect(result.data).toHaveLength(3);
      assertEnrichment(result, 'relations', {
        1: [{ id: 1, rootId: 1, title: 'Relation 1', isLatest: true }],
        2: [
          { id: 2, rootId: 2, title: 'Relation 2', isLatest: true },
          { id: 3, rootId: 2, title: 'Relation 3', isLatest: false },
        ],
        3: [], // Root 3 has no relations (LEFT JOIN behavior)
      });
    });

    it('should use LEFT JOIN when join: "LEFT" is explicitly specified', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      relation.join = 'LEFT'; // Explicitly specify LEFT JOIN
      const req = await mocks.createTestQuery({ page: '1', limit: '10' }, [
        relation,
      ]);

      const data = createMinimalRootRelationSet();
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.roots, { limit: 10, total: 3 }),
      );
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(data.relations, { total: 3 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Should use LEFT JOIN behavior
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 1 },
      ]);
      assertLeftJoinBehavior(mocks.rootListSpy);
      assertResultStructure(result, { count: 3, total: 3 });
    });

    it('should automatically inject $nnull filter for join: "INNER" forward relation', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
        {
          distinctFilter: {
            field: 'isLatest',
            operator: WhereOperator.EQ,
            value: true,
          },
        },
      );
      relation.join = 'INNER'; // Specify INNER JOIN
      const req = await mocks.createTestQuery({ page: '1', limit: '10' }, [
        relation,
      ]);

      const data = createMinimalRootRelationSet();
      // Only relations with rootId values (simulating INNER JOIN result)
      const innerJoinRelations = data.relations.filter(
        (relation) => relation.rootId,
      );
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(innerJoinRelations, { total: 3 }),
      );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.roots, { limit: 10, total: 3 }),
      );

      // ACT
      await mocks.service.list(req);

      // ASSERT - Should trigger INNER JOIN behavior with $nnull search condition
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          { ...Where.notNull('rootId'), relation: 'relations' },
          { ...Where.eq('isLatest', true), relation: 'relations' },
        ],
        limit: 10,
        offset: 0,
      });

      // Should trigger INNER JOIN behavior (relation-first)
      assertInnerJoinBehavior(
        mocks.rootListSpy,
        mocks.relationListSpy,
        [
          { ...Where.notNull('rootId'), relation: 'relations' },
          { ...Where.eq('isLatest', true), relation: 'relations' },
        ],
        [Where.in('id', [1, 2])],
      );
    });

    it('should preserve existing filters when injecting $nnull for INNER join', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
        {
          distinctFilter: {
            field: 'isLatest',
            operator: WhereOperator.EQ,
            value: true,
          },
        },
      );
      relation.join = 'INNER';
      const req = await mocks.createTestQuery(
        {
          filter: ['relations.status||$eq||active'], // Existing filter
          page: '1',
          limit: '10',
        },
        [relation],
      );

      const data = createMinimalRootRelationSet();
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(data.relations.slice(0, 2), { total: 2 }),
      );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.roots, { total: 2 }),
      );

      // ACT
      await mocks.service.list(req);

      // ASSERT - Should have both existing filter and injected $nnull in search conditions
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          { ...Where.eq('status', 'active'), relation: 'relations' },
          { ...Where.notNull('rootId'), relation: 'relations' },
          { ...Where.eq('isLatest', true), relation: 'relations' },
        ],
        limit: 10,
        offset: 0,
      });
    });

    it('should not inject duplicate $nnull filter if one already exists', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
        {
          distinctFilter: {
            field: 'isLatest',
            operator: WhereOperator.EQ,
            value: true,
          },
        },
      );
      relation.join = 'INNER';
      const req = await mocks.createTestQuery(
        {
          filter: ['relations.rootId||$nnull'], // Already has $nnull filter
          page: '1',
          limit: '10',
        },
        [relation],
      );

      const data = createMinimalRootRelationSet();
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(data.relations, { total: 3 }),
      );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.roots, { total: 2 }),
      );

      // ACT
      await mocks.service.list(req);

      // ASSERT - Should have only one $nnull search condition (not duplicated)
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          { ...Where.notNull('rootId'), relation: 'relations' },
          { ...Where.eq('isLatest', true), relation: 'relations' },
        ],
        limit: 10,
        offset: 0,
      });
    });
  });
});

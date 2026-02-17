import { Where, WhereOperator } from '@concepta/nestjs-common';

import { createPaginatedResponse } from '../../__FIXTURES__/crud-federation-mock-helpers';
import {
  assertHandlerCallCounts,
  assertRootListQuery,
  assertRelationQuery,
  assertRelationFirst,
  assertResultStructure,
  assertEnrichment,
  assertEmptyResult,
  assertSortOrder,
} from '../../__FIXTURES__/crud-federation-test-assertions';
import {
  createRelationSortByTitleSet,
  createRelationSortByPrioritySet,
  createRelationSortPaginationSet,
  createRelationSortEmptySet,
} from '../../__FIXTURES__/crud-federation-test-data';
import { createOneToManyForwardRelation } from '../../__FIXTURES__/crud-federation-test-entities';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../../__FIXTURES__/crud-federation-test-setup';

/**
 * Behavior tests for relation sort strategy (Scenario 13)
 * Relation sort requires INNER JOIN semantics with $nnull filter on join key
 * Causes relation-first sequencing with sort applied to driving relation
 */
describe('CrudFederationService - Behavior: Relation Sort Strategy', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  describe('Forward relationship relation sort', () => {
    it('should sort roots by relation field with distinctFilter and $nnull filter', async () => {
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
        }, // distinctFilter for uniqueness
      );
      const req = await mocks.createTestQuery(
        {
          sort: ['relations.title,ASC'],
          page: '1',
          limit: '10',
        },
        [relation],
      );

      const data = createRelationSortByTitleSet();

      // Sequential approach: constraint call + enrichment call
      mocks.relationListSpy
        .mockResolvedValueOnce(
          createPaginatedResponse(data.relationsByTitle.slice(0, 3), {
            total: 3,
          }),
        )
        .mockResolvedValueOnce(
          createPaginatedResponse(data.relationsByTitle, {
            total: 4,
          }),
        );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.rootsInNaturalOrder, {
          limit: 10,
          total: 3,
        }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 2 }, // constraint + enrichment
      ]);

      // Verify first call: relation handler called with user pagination and distinctFilter applied
      assertRelationQuery(
        mocks.relationListSpy,
        {
          limit: 10,
          offset: 0,
          page: undefined,
          sort: [{ field: 'title', order: 'ASC' }],
          filter: [
            Where.rel('relations', Where.notNull('rootId')),
            Where.rel('relations', Where.eq('isLatest', true)),
          ],
        },
        0,
      );

      // Verify distinctFilter was applied to first call
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          Where.rel('relations', Where.notNull('rootId')),
          Where.rel('relations', Where.eq('isLatest', true)),
        ],
        limit: 10,
        offset: 0,
        sort: [{ field: 'title', order: 'ASC' }],
      });

      // Verify second call: enrichment call for discovered root IDs
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            Where.rel('relations', Where.notNull('rootId')),
            Where.rel('relations', Where.eq('isLatest', true)),
            Where.rel('relations', Where.in('rootId', [2, 1, 3])),
          ],
        },
        1,
      );

      // Verify root request has discovered IDs
      assertRootListQuery(mocks.rootListSpy, {
        filter: [Where.in('id', [2, 1, 3])], // Root IDs discovered from sorted relations
        page: 1,
        limit: 10,
        sort: [], // No root sorts (relation sort takes precedence)
      });

      // ASSERT - Result verification
      assertResultStructure(result, { count: 3, total: 3 });

      // Verify sort order preserved in final results
      assertSortOrder(result, [2, 1, 3]); // Roots in relation sort order

      // Verify enrichment
      assertEnrichment(result, 'relations', {
        2: [{ id: 1, rootId: 2, title: 'Alpha Task' }],
        1: [
          { id: 2, rootId: 1, title: 'Beta Task' },
          { id: 4, rootId: 1, title: 'Delta Task' },
        ],
        3: [{ id: 3, rootId: 3, title: 'Charlie Task' }],
      });
    });

    it('should handle relation sort with additional AND filters', async () => {
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
        }, // distinctFilter for uniqueness
      );
      const req = await mocks.createTestQuery(
        {
          filter: ['relations.priority||$gte||5'],
          sort: ['relations.priority,DESC'],
          page: '1',
          limit: '10',
        },
        [relation],
      );

      const data = createRelationSortByPrioritySet();
      // Only relations with priority >= 5, and only first relation per rootId (distinctFilter effect)
      const highPriorityRelations = data.relationsByPriority
        .filter((relation) => relation.priority >= 5)
        .filter(
          (relation, index, array) =>
            array.findIndex((r) => r.rootId === relation.rootId) === index,
        );

      // First call: distinctFilter applied for sorting (3 unique relations)
      // Second call: all high priority relations for enrichment (4 total high priority relations)
      const allHighPriorityRelations = data.relationsByPriority.filter(
        (relation) => relation.priority >= 5,
      );
      mocks.relationListSpy
        .mockResolvedValueOnce(
          createPaginatedResponse(highPriorityRelations, { total: 3 }),
        )
        .mockResolvedValueOnce(
          createPaginatedResponse(allHighPriorityRelations, { total: 4 }),
        );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.uniqueRootsInOrder, {
          limit: 10,
          total: 3,
        }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 2 }, // constraint + enrichment
      ]);

      // Verify relation called first (relation-sort pattern)
      assertRelationFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      // Verify first call: relation handler called with multiple filters and sort
      assertRelationQuery(
        mocks.relationListSpy,
        {
          limit: 10,
          offset: 0,
          page: undefined,
          filter: [
            Where.rel('relations', Where.gte('priority', 5)),
            Where.rel('relations', Where.notNull('rootId')),
            Where.rel('relations', Where.eq('isLatest', true)),
          ],
          sort: [{ field: 'priority', order: 'DESC' }],
        },
        0,
      );

      // Verify second call: enrichment call for discovered root IDs
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            Where.rel('relations', Where.gte('priority', 5)),
            Where.rel('relations', Where.notNull('rootId')),
            Where.rel('relations', Where.eq('isLatest', true)),
            Where.rel('relations', Where.in('rootId', [1, 2, 3])),
          ],
        },
        1,
      );

      // Verify root request has discovered IDs and correct pagination
      assertRootListQuery(mocks.rootListSpy, {
        filter: [Where.in('id', [1, 2, 3])],
        page: 1,
        limit: 10,
        sort: [],
      });

      // ASSERT - Result verification
      assertResultStructure(result, { count: 3, total: 3 });
      assertSortOrder(result, [1, 2, 3]); // Sorted by priority DESC
    });

    it('should deduplicate roots when multiple relations match', async () => {
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
        }, // distinctFilter for uniqueness
      );
      const req = await mocks.createTestQuery(
        {
          sort: ['relations.priority,DESC'],
          page: '1',
          limit: '10',
        },
        [relation],
      );

      const data = createRelationSortByPrioritySet();
      // Apply distinctFilter effect - only first relation per rootId
      const uniqueRelations = data.relationsByPriority.filter(
        (relation, index, array) =>
          array.findIndex((r) => r.rootId === relation.rootId) === index,
      );

      // First call: distinctFilter applied for sorting (unique relations)
      // Second call: all relations for enrichment
      mocks.relationListSpy
        .mockResolvedValueOnce(
          createPaginatedResponse(uniqueRelations, { total: 3 }),
        )
        .mockResolvedValueOnce(
          createPaginatedResponse(data.relationsByPriority, {
            total: data.relationsByPriority.length,
          }),
        );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.uniqueRootsInOrder, {
          limit: 10,
          total: 3,
        }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 2 }, // constraint + enrichment
      ]);

      // Verify relation called first (relation-sort pattern)
      assertRelationFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      // Verify first call: relation handler called with filter and sort
      assertRelationQuery(
        mocks.relationListSpy,
        {
          limit: 10,
          offset: 0,
          page: undefined,
          filter: [
            Where.rel('relations', Where.notNull('rootId')),
            Where.rel('relations', Where.eq('isLatest', true)),
          ],
          sort: [{ field: 'priority', order: 'DESC' }],
        },
        0,
      );

      // Verify second call: enrichment call for discovered root IDs
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            Where.rel('relations', Where.notNull('rootId')),
            Where.rel('relations', Where.eq('isLatest', true)),
            Where.rel('relations', Where.in('rootId', [1, 2, 3])),
          ],
        },
        1,
      );

      // Verify root request has discovered IDs and correct pagination
      assertRootListQuery(mocks.rootListSpy, {
        filter: [Where.in('id', [1, 2, 3])], // Deduplicated root IDs
        page: 1,
        limit: 10,
        sort: [],
      });

      // Roots appear only once despite multiple relations
      assertResultStructure(result, { count: 3, total: 3 });
      expect(result.data.map((p) => p.id)).toEqual([1, 2, 3]);
    });

    it('should return empty result when no relations match with sort', async () => {
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
        }, // distinctFilter for uniqueness
      );
      const req = await mocks.createTestQuery(
        {
          filter: ['relations.status||$eq||archived'],
          sort: ['relations.title,ASC'],
        },
        [relation],
      );

      const data = createRelationSortEmptySet();

      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(data.relations, { total: 0 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - No relations found, so root not called
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 0 },
        { handler: mocks.relationListSpy, count: 1 }, // Only one call since no relations found
      ]);

      // Verify the single relation handler call had correct filters and sort
      assertRelationQuery(
        mocks.relationListSpy,
        {
          limit: 10,
          offset: 0,
          page: undefined,
          filter: [
            Where.rel('relations', Where.eq('status', 'archived')),
            Where.rel('relations', Where.notNull('rootId')),
            Where.rel('relations', Where.eq('isLatest', true)),
          ],
          sort: [{ field: 'title', order: 'ASC' }],
        },
        0,
      );

      assertEmptyResult(result);
    });

    it('should apply relation sort with pagination correctly', async () => {
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
        }, // distinctFilter for uniqueness
      );
      const req = await mocks.createTestQuery(
        {
          sort: ['relations.title,ASC'],
          page: '1',
          limit: '5', // First page, 5 roots
        },
        [relation],
      );

      const data = createRelationSortPaginationSet();

      // First call: distinctFilter applied for sorting (paginated relations - first 5 for page 1)
      // Second call: enrichment for discovered root IDs from page 1 (same 5 relations)
      const firstPageRelations = data.allRelationsSorted.slice(0, 5); // First 5 relations for page 1
      mocks.relationListSpy
        .mockResolvedValueOnce(
          createPaginatedResponse(firstPageRelations, { total: 10 }), // Total across all pages
        )
        .mockResolvedValueOnce(
          createPaginatedResponse(firstPageRelations, { total: 5 }), // Current page count
        );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.firstPageRoots, { limit: 5, total: 10 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 2 }, // constraint + enrichment
      ]);

      // Verify relation called first (relation-sort pattern)
      assertRelationFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      // Verify first call: relation handler called with filter and sort
      assertRelationQuery(
        mocks.relationListSpy,
        {
          limit: 5,
          offset: 0,
          page: undefined,
          filter: [
            Where.rel('relations', Where.notNull('rootId')),
            Where.rel('relations', Where.eq('isLatest', true)),
          ],
          sort: [{ field: 'title', order: 'ASC' }],
        },
        0,
      );

      // Verify second call: enrichment call for paginated root IDs only (first page)
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            Where.rel('relations', Where.notNull('rootId')),
            Where.rel('relations', Where.eq('isLatest', true)),
            Where.rel('relations', Where.in('rootId', [5, 2, 8, 1, 9])),
          ],
        },
        1,
      );

      // Verify root request has only paginated root IDs (page 1: first 5)
      assertRootListQuery(mocks.rootListSpy, {
        filter: [Where.in('id', [5, 2, 8, 1, 9])], // Only first page root IDs
        limit: 5, // Page limit, not total discovered count
        page: 1,
        sort: [],
      });

      // Verify pagination structure
      expect(result.count).toBe(5);
      expect(result.total).toBe(10);
      expect(result.page).toBe(1);
      expect(result.pageCount).toBe(2);

      // Verify first page sort order
      assertSortOrder(result, [5, 2, 8, 1, 9]);
    });

    it('should apply relation sort with pagination correctly for page 2', async () => {
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
        }, // distinctFilter for uniqueness
      );
      const req = await mocks.createTestQuery(
        {
          sort: ['relations.title,ASC'],
          page: '2',
          limit: '5', // Second page, 5 roots
        },
        [relation],
      );

      const data = createRelationSortPaginationSet();

      // First call: distinctFilter applied for sorting (paginated relations - second 5 for page 2)
      // Second call: enrichment for discovered root IDs from page 2 (same 5 relations)
      const secondPageRelations = data.allRelationsSorted.slice(5, 10); // Second 5 relations for page 2
      mocks.relationListSpy
        .mockResolvedValueOnce(
          createPaginatedResponse(secondPageRelations, { total: 10 }), // Total across all pages
        )
        .mockResolvedValueOnce(
          createPaginatedResponse(secondPageRelations, { total: 5 }), // Current page count
        );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.secondPageRoots, {
          limit: 5,
          total: 10,
        }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 2 }, // constraint + enrichment
      ]);

      // Verify relation called first (relation-sort pattern)
      assertRelationFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      // Verify first call: relation handler called with filter and sort
      assertRelationQuery(
        mocks.relationListSpy,
        {
          limit: 5,
          offset: 5,
          page: undefined,
          filter: [
            Where.rel('relations', Where.notNull('rootId')),
            Where.rel('relations', Where.eq('isLatest', true)),
          ],
          sort: [{ field: 'title', order: 'ASC' }],
        },
        0,
      );

      // Verify second call: enrichment call for paginated root IDs only (second page)
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            Where.rel('relations', Where.notNull('rootId')),
            Where.rel('relations', Where.eq('isLatest', true)),
            Where.rel('relations', Where.in('rootId', [4, 7, 3, 6, 10])),
          ],
        },
        1,
      );

      // Verify root request has only paginated root IDs (page 2: second 5)
      assertRootListQuery(mocks.rootListSpy, {
        filter: [Where.in('id', [4, 7, 3, 6, 10])], // Only second page root IDs
        page: 1,
        limit: 5,
        sort: [],
      });

      // Verify pagination structure
      expect(result.count).toBe(5);
      expect(result.total).toBe(10);
      expect(result.page).toBe(2);
      expect(result.pageCount).toBe(2);

      // Verify second page sort order
      assertSortOrder(result, [4, 7, 3, 6, 10]); // Foxtrot, Golf, Hotel, India, Juliet
    });
  });
});

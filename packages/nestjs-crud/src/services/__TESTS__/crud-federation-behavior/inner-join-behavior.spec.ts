import { Where, WhereOperator } from '@concepta/nestjs-common';

import { createPaginatedResponse } from '../../__FIXTURES__/crud-federation-mock-helpers';
import {
  assertHandlerCallCounts,
  assertResultStructure,
  assertEmptyResult,
  assertRelationQuery,
  assertRootListQuery,
  assertRelationFirst,
  assertRootFirst,
} from '../../__FIXTURES__/crud-federation-test-assertions';
import {
  createMinimalRootRelationSet,
  createFilteredDataSet,
  createPriorityDataSet,
  createCombinedFiltersSet,
} from '../../__FIXTURES__/crud-federation-test-data';
import { createOneToManyForwardRelation } from '../../__FIXTURES__/crud-federation-test-entities';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../../__FIXTURES__/crud-federation-test-setup';

/**
 * Behavior tests for INNER JOIN pattern achieved through right-side filters
 *
 * Key Concept: While LEFT JOIN is the default federation behavior (all roots returned),
 * INNER JOIN can be achieved using existence filters on relation fields like:
 * - relations.rootId||$nnull
 * - relations.status||$nnull
 *
 * This causes only roots with matching relations to be returned.
 */
describe('CrudFederationService - Behavior: INNER JOIN via Filters', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  describe('Forward Relationships with INNER JOIN', () => {
    it('should constrain root results when relation existence filter present (INNER JOIN)', async () => {
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

      const req = await mocks.createTestQuery(
        { filter: ['relations.rootId||$nnull'], page: 1, limit: 10 },
        [relation],
      );

      const data = createMinimalRootRelationSet();

      mocks.rootListSpy.mockResolvedValueOnce(
        createPaginatedResponse(data.roots.slice(0, 2), {
          limit: 10,
          total: 2,
        }),
      );

      mocks.relationListSpy
        .mockResolvedValueOnce(
          createPaginatedResponse(data.relations.slice(0, 2), { total: 2 }),
        )
        .mockResolvedValueOnce(
          createPaginatedResponse(data.relations.slice(0, 3), { total: 3 }),
        );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          { ...Where.notNull('rootId'), relation: 'relations' },
          { ...Where.eq('isLatest', true), relation: 'relations' },
        ],
        limit: 10,
        offset: 0,
      });

      // Second relation call - enrichment with discovered root IDs
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            { ...Where.notNull('rootId'), relation: 'relations' },
            { ...Where.eq('isLatest', true), relation: 'relations' },
            { ...Where.in('rootId', [1, 2]), relation: 'relations' },
          ],
        },
        1,
      );

      assertRootListQuery(mocks.rootListSpy, {
        filter: [Where.in('id', [1, 2])],
        page: 1,
        limit: 10,
      });

      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 2 },
      ]);

      const expectedData = [
        {
          ...data.roots[0],
          relations: [data.relations[0]],
        },
        {
          ...data.roots[1],
          relations: [data.relations[1], data.relations[2]],
        },
      ];

      assertResultStructure(result, {
        count: 2,
        total: 2,
        pageCount: 1,
        page: 1,
        limit: 10,
        data: expectedData,
      });
    });

    it('should apply INNER JOIN with relation value filters (status=active)', async () => {
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
      const req = await mocks.createTestQuery(
        { filter: ['relations.status||$eq||active'] },
        [relation],
      );
      const data = createFilteredDataSet();

      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(data.activeRelations, { total: 2 }),
      );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.roots.slice(0, 2), {
          limit: 10,
          total: 2,
        }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          { ...Where.eq('status', 'active'), relation: 'relations' },
          { ...Where.eq('isLatest', true), relation: 'relations' },
        ],
        limit: 10,
        offset: 0,
      });

      // Second relation call - enrichment with discovered root IDs
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            { ...Where.eq('status', 'active'), relation: 'relations' },
            { ...Where.eq('isLatest', true), relation: 'relations' },
            { ...Where.in('rootId', [1, 2]), relation: 'relations' },
          ],
        },
        1,
      );

      assertRootListQuery(mocks.rootListSpy, {
        filter: [Where.in('id', [1, 2])],
        page: 1,
        limit: 10,
      });

      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 2 },
      ]);

      assertRelationFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      const expectedData = [
        {
          ...data.roots[0],
          relations: [data.activeRelations[0]],
        },
        {
          ...data.roots[1],
          relations: [data.activeRelations[1]],
        },
      ];

      assertResultStructure(result, {
        count: 2,
        total: 2,
        page: 1,
        pageCount: 1,
        limit: 10,
        data: expectedData,
      });
    });

    it('should apply INNER JOIN with multiple relation filters (AND condition)', async () => {
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
      const req = await mocks.createTestQuery(
        {
          filter: [
            'relations.status||$eq||active',
            'relations.priority||$gte||5',
          ],
        },
        [relation],
      );
      const data = createPriorityDataSet();

      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(data.highPriorityActiveRelations, {
          total: 2,
        }),
      );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.roots, { limit: 10, total: 2 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          { ...Where.eq('status', 'active'), relation: 'relations' },
          { ...Where.gte('priority', 5), relation: 'relations' },
          { ...Where.eq('isLatest', true), relation: 'relations' },
        ],
        limit: 10,
        offset: 0,
      });

      // Second relation call - enrichment with discovered root IDs
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            { ...Where.eq('status', 'active'), relation: 'relations' },
            { ...Where.gte('priority', 5), relation: 'relations' },
            { ...Where.eq('isLatest', true), relation: 'relations' },
            { ...Where.in('rootId', [1, 2]), relation: 'relations' },
          ],
        },
        1,
      );

      assertRootListQuery(mocks.rootListSpy, {
        filter: [Where.in('id', [1, 2])],
        page: 1,
        limit: 10,
      });

      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.relationListSpy, count: 2 },
      ]);

      assertRelationFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      const expectedData = [
        {
          ...data.roots[0],
          relations: [data.highPriorityActiveRelations[0]],
        },
        {
          ...data.roots[1],
          relations: [data.highPriorityActiveRelations[1]],
        },
      ];

      assertResultStructure(result, {
        count: 2,
        total: 2,
        page: 1,
        pageCount: 1,
        limit: 10,
        data: expectedData,
      });
    });

    it('should return empty result when no relations match filters (INNER JOIN)', async () => {
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
      const req = await mocks.createTestQuery(
        { filter: ['relations.status||$eq||archived'] },
        [relation],
      );

      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse([], { total: 0 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 0 },
        { handler: mocks.relationListSpy, count: 1 },
      ]);
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          { ...Where.eq('status', 'archived'), relation: 'relations' },
          { ...Where.eq('isLatest', true), relation: 'relations' },
        ],
        limit: 10,
        offset: 0,
      });
      assertEmptyResult(result);
    });

    it('should apply INNER JOIN with combined root and relation filters', async () => {
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

      const req = await mocks.createTestQuery(
        {
          filter: ['name||$contains||Project', 'relations.status||$eq||active'],
          page: 1,
          limit: 10,
        },
        [relation],
      );

      const data = createCombinedFiltersSet();

      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(data.activeRelations, { total: 2 }),
      );

      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(data.projectRoots, { limit: 10, total: 2 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT
      assertRootListQuery(mocks.rootListSpy, {
        filter: [Where.contains('name', 'Project'), Where.in('id', [1, 2])],
        page: 1,
        limit: 1,
      });

      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          { ...Where.eq('status', 'active'), relation: 'relations' },
          { ...Where.eq('isLatest', true), relation: 'relations' },
        ],
        limit: 10,
        offset: 0,
      });

      // Second relation call - enrichment with discovered root IDs
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            { ...Where.eq('status', 'active'), relation: 'relations' },
            { ...Where.eq('isLatest', true), relation: 'relations' },
            { ...Where.in('rootId', [1, 2]), relation: 'relations' },
          ],
        },
        1,
      );

      assertRootListQuery(
        mocks.rootListSpy,
        {
          filter: [Where.contains('name', 'Project'), Where.in('id', [1, 2])],
          page: 1,
          limit: 10,
        },
        1,
      );

      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 2 },
        { handler: mocks.relationListSpy, count: 2 },
      ]);

      assertRootFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      const expectedData = [
        {
          ...data.projectRoots[0],
          relations: [data.activeRelations[0]],
        },
        {
          ...data.projectRoots[1],
          relations: [data.activeRelations[1]],
        },
      ];

      assertResultStructure(result, {
        count: 2,
        total: 2,
        page: 1,
        pageCount: 1,
        limit: 10,
        data: expectedData,
      });
    });

    describe('INNER JOIN with Pagination', () => {
      it('should handle INNER JOIN with pagination on page 1', async () => {
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
        const req = await mocks.createTestQuery(
          {
            filter: ['relations.status||$eq||active'],
            page: '1',
            limit: '3',
          },
          [relation],
        );

        // Create test data - roots 1,2,3,5,7 have active relations
        const activeRelations = [
          { id: 1, rootId: 1, title: 'Relation 1A', status: 'active' },
          { id: 2, rootId: 2, title: 'Relation 2A', status: 'active' },
          { id: 3, rootId: 3, title: 'Relation 3A', status: 'active' },
          { id: 4, rootId: 5, title: 'Relation 5A', status: 'active' },
          { id: 5, rootId: 7, title: 'Relation 7A', status: 'active' },
        ];

        const page1Roots = [
          { id: 1, name: 'Root 1' },
          { id: 2, name: 'Root 2' },
          { id: 3, name: 'Root 3' },
        ];

        mocks.relationListSpy.mockResolvedValue(
          createPaginatedResponse(activeRelations.slice(0, 3), { total: 5 }),
        );
        mocks.rootListSpy.mockResolvedValue(
          createPaginatedResponse(page1Roots, { limit: 3, total: 5 }),
        );

        // ACT
        const result = await mocks.service.list(req);

        // ASSERT
        assertRelationQuery(mocks.relationListSpy, {
          filter: [
            { ...Where.eq('status', 'active'), relation: 'relations' },
            { ...Where.eq('isLatest', true), relation: 'relations' },
          ],
          limit: 3,
          offset: 0,
        });

        // Second relation call - enrichment with discovered root IDs
        assertRelationQuery(
          mocks.relationListSpy,
          {
            filter: [
              { ...Where.eq('status', 'active'), relation: 'relations' },
              { ...Where.eq('isLatest', true), relation: 'relations' },
              { ...Where.in('rootId', [1, 2, 3]), relation: 'relations' },
            ],
          },
          1,
        );

        assertRootListQuery(mocks.rootListSpy, {
          filter: [Where.in('id', [1, 2, 3])],
          page: 1,
          limit: 3,
        });

        assertHandlerCallCounts([
          { handler: mocks.rootListSpy, count: 1 },
          { handler: mocks.relationListSpy, count: 2 },
        ]);

        assertRelationFirst(mocks.rootListSpy, [mocks.relationListSpy]);

        const expectedData = page1Roots.map((root, index) => ({
          ...root,
          relations: [activeRelations[index]],
        }));

        assertResultStructure(result, {
          count: 3,
          total: 5,
          page: 1,
          pageCount: 2,
          limit: 3,
          data: expectedData,
        });
      });

      it('should handle INNER JOIN with pagination on page 2', async () => {
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
        const req = await mocks.createTestQuery(
          {
            filter: ['relations.status||$eq||active'],
            page: '2',
            limit: '3',
          },
          [relation],
        );

        // Same active relations as page 1
        const activeRelations = [
          { id: 1, rootId: 1, title: 'Relation 1A', status: 'active' },
          { id: 2, rootId: 2, title: 'Relation 2A', status: 'active' },
          { id: 3, rootId: 3, title: 'Relation 3A', status: 'active' },
          { id: 4, rootId: 5, title: 'Relation 5A', status: 'active' },
          { id: 5, rootId: 7, title: 'Relation 7A', status: 'active' },
        ];

        // Page 2 roots (remaining 2 roots)
        const page2Roots = [
          { id: 5, name: 'Root 5' },
          { id: 7, name: 'Root 7' },
        ];

        mocks.relationListSpy.mockResolvedValue(
          createPaginatedResponse(activeRelations.slice(3), { total: 5 }),
        );
        mocks.rootListSpy.mockResolvedValue(
          createPaginatedResponse(page2Roots, { limit: 3, total: 5 }),
        );

        // ACT
        const result = await mocks.service.list(req);

        // ASSERT
        assertRelationQuery(mocks.relationListSpy, {
          filter: [
            { ...Where.eq('status', 'active'), relation: 'relations' },
            { ...Where.eq('isLatest', true), relation: 'relations' },
          ],
          limit: 3,
          offset: 3, // Page 2: (2-1) * 3 = 3
        });

        // Second relation call - enrichment with discovered root IDs
        assertRelationQuery(
          mocks.relationListSpy,
          {
            filter: [
              { ...Where.eq('status', 'active'), relation: 'relations' },
              { ...Where.eq('isLatest', true), relation: 'relations' },
              { ...Where.in('rootId', [5, 7]), relation: 'relations' },
            ],
          },
          1,
        );

        assertRootListQuery(mocks.rootListSpy, {
          filter: [Where.in('id', [5, 7])],
          page: 1,
          limit: 3,
        });

        assertHandlerCallCounts([
          { handler: mocks.rootListSpy, count: 1 },
          { handler: mocks.relationListSpy, count: 2 },
        ]);

        assertRelationFirst(mocks.rootListSpy, [mocks.relationListSpy]);

        const expectedData = page2Roots.map((root, index) => ({
          ...root,
          relations: [activeRelations.slice(3)[index]],
        }));

        assertResultStructure(result, {
          count: 2,
          total: 5,
          page: 2,
          pageCount: 2,
          limit: 3,
          data: expectedData,
        });
      });

      it('should handle INNER JOIN pagination when filter reduces results below page size', async () => {
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
        const req = await mocks.createTestQuery(
          {
            filter: ['relations.status||$eq||critical'],
            page: '1',
            limit: '5', // Request 5 but only 2 roots have critical relations
          },
          [relation],
        );

        const criticalRelations = [
          { id: 1, rootId: 1, title: 'Critical Task A', status: 'critical' },
          { id: 2, rootId: 3, title: 'Critical Task B', status: 'critical' },
        ];

        const filteredRoots = [
          { id: 1, name: 'Root 1' },
          { id: 3, name: 'Root 3' },
        ];

        mocks.relationListSpy.mockResolvedValue(
          createPaginatedResponse(criticalRelations, { total: 2 }),
        );
        mocks.rootListSpy.mockResolvedValue(
          createPaginatedResponse(filteredRoots, { limit: 5, total: 2 }),
        );

        // ACT
        const result = await mocks.service.list(req);

        // ASSERT
        assertRelationQuery(mocks.relationListSpy, {
          filter: [
            { ...Where.eq('status', 'critical'), relation: 'relations' },
            { ...Where.eq('isLatest', true), relation: 'relations' },
          ],
          limit: 5,
          offset: 0,
        });

        // Second relation call - enrichment with discovered root IDs
        assertRelationQuery(
          mocks.relationListSpy,
          {
            filter: [
              { ...Where.eq('status', 'critical'), relation: 'relations' },
              { ...Where.eq('isLatest', true), relation: 'relations' },
              { ...Where.in('rootId', [1, 3]), relation: 'relations' },
            ],
          },
          1,
        );

        assertRootListQuery(mocks.rootListSpy, {
          filter: [Where.in('id', [1, 3])],
          page: 1,
          limit: 5,
        });

        assertHandlerCallCounts([
          { handler: mocks.rootListSpy, count: 1 },
          { handler: mocks.relationListSpy, count: 2 },
        ]);

        assertRelationFirst(mocks.rootListSpy, [mocks.relationListSpy]);

        const expectedData = filteredRoots.map((root, index) => ({
          ...root,
          relations: [criticalRelations[index]],
        }));

        assertResultStructure(result, {
          count: 2,
          total: 2,
          page: 1,
          pageCount: 1,
          limit: 5,
          data: expectedData,
        });
      });
    });

    describe('INNER JOIN with Relation Sorting', () => {
      it('should preserve relation sort order in INNER JOIN scenario', async () => {
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
            filter: [
              'relations.status||$eq||active',
              'relations.rootId||$nnull',
            ], // INNER JOIN trigger + required $nnull
            sort: ['relations.title,ASC'], // Relation sort
          },
          [relation],
        );

        // Relation data sorted by title: Alpha, Beta, Charlie
        const sortedActiveRelations = [
          { id: 1, rootId: 2, title: 'Alpha Task', status: 'active' },
          { id: 2, rootId: 1, title: 'Beta Task', status: 'active' },
          { id: 3, rootId: 3, title: 'Charlie Task', status: 'active' },
        ];

        // Root data returned in natural order (NOT relation sort order)
        const rootsInNaturalOrder = [
          { id: 1, name: 'Root 1' },
          { id: 2, name: 'Root 2' },
          { id: 3, name: 'Root 3' },
        ];

        // First call: distinctFilter applied for sorting (unique relations)
        // Second call: all active relations for enrichment
        mocks.relationListSpy
          .mockResolvedValueOnce(
            createPaginatedResponse(sortedActiveRelations, { total: 3 }),
          )
          .mockResolvedValueOnce(
            createPaginatedResponse(sortedActiveRelations, { total: 3 }),
          );
        mocks.rootListSpy.mockResolvedValue(
          createPaginatedResponse(rootsInNaturalOrder, {
            limit: 3,
            total: 3,
          }),
        );

        // ACT
        const result = await mocks.service.list(req);

        // ASSERT - Handler call verification
        assertHandlerCallCounts([
          { handler: mocks.rootListSpy, count: 1 },
          { handler: mocks.relationListSpy, count: 2 },
        ]);
        assertRelationFirst(mocks.rootListSpy, [mocks.relationListSpy]);

        // Verify first call: relation handler called with INNER JOIN filter and sort
        assertRelationQuery(
          mocks.relationListSpy,
          {
            limit: 10,
            offset: 0,
            filter: [
              { ...Where.eq('status', 'active'), relation: 'relations' },
              { ...Where.notNull('rootId'), relation: 'relations' },
              { ...Where.eq('isLatest', true), relation: 'relations' },
            ],
            sort: [{ field: 'title', order: 'ASC' }],
          },
          0,
        );

        // Verify second call: enrichment call for discovered root IDs
        assertRelationQuery(
          mocks.relationListSpy,
          {
            filter: [
              { ...Where.eq('status', 'active'), relation: 'relations' },
              { ...Where.notNull('rootId'), relation: 'relations' },
              { ...Where.eq('isLatest', true), relation: 'relations' },
              { ...Where.in('rootId', [2, 1, 3]), relation: 'relations' },
            ],
          },
          1,
        );

        // Verify root handler called with discovered IDs from sorted relations
        assertRootListQuery(mocks.rootListSpy, {
          filter: [Where.in('id', [2, 1, 3])], // IDs in relation sort order
          page: 1,
          limit: 10,
        });

        // ASSERT - Result verification: roots should be in relation sort order [2, 1, 3]
        // Create expected data in sorted order based on relation title sorting
        const expectedData = [
          {
            ...rootsInNaturalOrder[1], // Root 2 (Alpha Task)
            relations: [sortedActiveRelations[0]],
          },
          {
            ...rootsInNaturalOrder[0], // Root 1 (Beta Task)
            relations: [sortedActiveRelations[1]],
          },
          {
            ...rootsInNaturalOrder[2], // Root 3 (Charlie Task)
            relations: [sortedActiveRelations[2]],
          },
        ];

        assertResultStructure(result, {
          count: 3,
          total: 3,
          page: 1,
          pageCount: 1,
          limit: 10,
          data: expectedData,
        });
      });

      it('should handle INNER JOIN with relation sort and multiple relations per root', async () => {
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
            filter: ['relations.priority||$gte||5', 'relations.rootId||$nnull'], // INNER JOIN trigger + required $nnull
            sort: ['relations.priority,DESC'], // Relation sort by priority
          },
          [relation],
        );

        // Relations sorted by priority DESC with multiple per root
        const sortedHighPriorityRelations = [
          {
            id: 1,
            rootId: 1,
            title: 'Critical',
            priority: 10,
            status: 'active',
          },
          { id: 2, rootId: 1, title: 'High A', priority: 8, status: 'active' },
          { id: 3, rootId: 2, title: 'High B', priority: 7, status: 'active' },
          { id: 4, rootId: 3, title: 'Medium', priority: 5, status: 'active' },
        ];

        // Roots in natural order (will be re-ordered by service)
        const rootsInNaturalOrder = [
          { id: 1, name: 'Root 1' },
          { id: 2, name: 'Root 2' },
          { id: 3, name: 'Root 3' },
        ];

        // First call: distinctFilter applied for sorting (unique relations)
        // Second call: all high priority relations for enrichment
        const uniqueHighPriorityRelations = sortedHighPriorityRelations.filter(
          (relation, index, array) =>
            array.findIndex((r) => r.rootId === relation.rootId) === index,
        );
        mocks.relationListSpy
          .mockResolvedValueOnce(
            createPaginatedResponse(uniqueHighPriorityRelations, { total: 3 }),
          )
          .mockResolvedValueOnce(
            createPaginatedResponse(sortedHighPriorityRelations, { total: 4 }),
          );
        mocks.rootListSpy.mockResolvedValue(
          createPaginatedResponse(rootsInNaturalOrder, {
            limit: 3,
            total: 3,
          }),
        );

        // ACT
        const result = await mocks.service.list(req);

        // ASSERT - Handler call verification
        assertHandlerCallCounts([
          { handler: mocks.rootListSpy, count: 1 },
          { handler: mocks.relationListSpy, count: 2 },
        ]);
        assertRelationFirst(mocks.rootListSpy, [mocks.relationListSpy]);

        // Verify first call: relation handler called with filter and sort
        assertRelationQuery(
          mocks.relationListSpy,
          {
            limit: 10,
            offset: 0,
            filter: [
              { ...Where.gte('priority', 5), relation: 'relations' },
              { ...Where.notNull('rootId'), relation: 'relations' },
              { ...Where.eq('isLatest', true), relation: 'relations' },
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
              { ...Where.gte('priority', 5), relation: 'relations' },
              { ...Where.notNull('rootId'), relation: 'relations' },
              { ...Where.eq('isLatest', true), relation: 'relations' },
              { ...Where.in('rootId', [1, 2, 3]), relation: 'relations' },
            ],
          },
          1,
        );

        // Verify root handler called with deduped IDs in relation order [1, 2, 3]
        assertRootListQuery(mocks.rootListSpy, {
          filter: [Where.in('id', [1, 2, 3])],
          page: 1,
          limit: 10,
        });

        // ASSERT - Result verification: roots should be ordered by first relation occurrence
        // Create expected data ordered by first occurrence in priority-sorted relations
        const expectedData = [
          {
            ...rootsInNaturalOrder[0], // Root 1 (has Critical + High A)
            relations: sortedHighPriorityRelations.filter(
              (r) => r.rootId === 1,
            ),
          },
          {
            ...rootsInNaturalOrder[1], // Root 2 (has High B)
            relations: sortedHighPriorityRelations.filter(
              (r) => r.rootId === 2,
            ),
          },
          {
            ...rootsInNaturalOrder[2], // Root 3 (has Medium)
            relations: sortedHighPriorityRelations.filter(
              (r) => r.rootId === 3,
            ),
          },
        ];

        assertResultStructure(result, {
          count: 3,
          total: 3,
          page: 1,
          pageCount: 1,
          limit: 10,
          data: expectedData,
        });
      });
    });
  });
});

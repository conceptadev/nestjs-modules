import { Where, WhereOperator } from '@concepta/nestjs-common';

import { createPaginatedResponse } from '../../../__fixtures__/crud/mocks/crud-paginated-response.mock';
import {
  assertHandlerCallCounts,
  assertResultStructure,
  assertEnrichment,
  assertRelationQuery,
  assertRootListQuery,
  assertRootFirst,
} from '../fixtures/crud-federation-test-assertions';
import { createOneToManyForwardRelation } from '../fixtures/crud-federation-test-entities';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../fixtures/crud-federation-test-setup';

/**
 * Behavior tests for combined root and relation filters with pagination
 * Tests the interaction between root-side and relation-side filters
 * with proper INNER JOIN behavior and pagination handling
 */
describe('CrudFederationService - Behavior: Combined Root+Relation Filters', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  describe('Combined Filters with Pagination', () => {
    it('should handle root filter + relation filter with page 1', async () => {
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
          page: '1',
          limit: '3',
        },
        [relation],
      );

      // Test data - 5 roots match name filter, but only 3 have active relations
      const activeRelations = [
        {
          id: 1,
          rootId: 1,
          title: 'Feature A',
          status: 'active',
          isLatest: true,
        },
        {
          id: 2,
          rootId: 2,
          title: 'Feature B',
          status: 'active',
          isLatest: true,
        },
        {
          id: 3,
          rootId: 4,
          title: 'Feature C',
          status: 'active',
          isLatest: true,
        },
        // Root 3 and 5 have inactive relations or no relations
      ];

      const page1ProjectRoots = [
        { id: 1, name: 'Project Alpha' },
        { id: 2, name: 'Project Beta' },
        { id: 4, name: 'Project Delta' },
      ];

      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(activeRelations, { total: 3 }),
      );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(page1ProjectRoots, { limit: 3, total: 3 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 2 }, // 1 total count + 1 data retrieval
        { handler: mocks.relationListSpy, count: 2 }, // 1 constraint discovery + 1 enrichment
      ]);
      assertRootFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      // Verify relation filter applied first (constraint discovery call)
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            Where.rel('relations', Where.eq('status', 'active')),
            Where.rel('relations', Where.eq('isLatest', true)),
          ],
          limit: 3,
          offset: 0,
        },
        0,
      );

      // Verify enrichment call (relation filter + root ID constraints)
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            Where.rel('relations', Where.eq('status', 'active')),
            Where.rel('relations', Where.eq('isLatest', true)),
            Where.rel('relations', Where.in('rootId', [1, 2, 4])),
          ],
        },
        1,
      );

      // Verify root total count call (first call - index 0) - includes root filters + discovered IDs
      assertRootListQuery(
        mocks.rootListSpy,
        {
          filter: [
            Where.contains('name', 'Project'),
            Where.in('id', [1, 2, 4]),
          ],
          page: 1,
          limit: 1,
        },
        0,
      );

      // Verify root data retrieval call (second call - index 1) - root filters + constraint IDs
      assertRootListQuery(
        mocks.rootListSpy,
        {
          filter: [
            Where.contains('name', 'Project'),
            Where.in('id', [1, 2, 4]),
          ],
          page: 1,
          limit: 3,
        },
        1,
      );

      // ASSERT - Result verification
      assertResultStructure(result, { count: 3, total: 3 });
      expect(result.page).toBe(1);
      expect(result.pageCount).toBe(1);

      assertEnrichment(result, 'relations', {
        1: [
          {
            id: 1,
            rootId: 1,
            title: 'Feature A',
            status: 'active',
            isLatest: true,
          },
        ],
        2: [
          {
            id: 2,
            rootId: 2,
            title: 'Feature B',
            status: 'active',
            isLatest: true,
          },
        ],
        4: [
          {
            id: 3,
            rootId: 4,
            title: 'Feature C',
            status: 'active',
            isLatest: true,
          },
        ],
      });
    });

    it('should handle root filter + relation filter with page 2', async () => {
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
          filter: ['name||$contains||Task', 'relations.priority||$gte||5'],
          page: '2',
          limit: '2',
        },
        [relation],
      );

      // Test data - roots with Task names and high priority relations
      const highPriorityRelations = [
        { id: 1, rootId: 1, title: 'Critical Task', priority: 10 },
        { id: 2, rootId: 2, title: 'High Task A', priority: 8 },
        { id: 3, rootId: 3, title: 'High Task B', priority: 7 },
        { id: 4, rootId: 5, title: 'Medium Task', priority: 5 },
        { id: 5, rootId: 6, title: 'Important Task', priority: 6 },
      ];

      // Page 2 of Task roots (with pagination applied)
      const page2TaskRoots = [
        { id: 5, name: 'Task Manager' },
        { id: 6, name: 'Task Scheduler' },
      ];

      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(highPriorityRelations, { total: 5 }),
      );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(page2TaskRoots, { limit: 2, total: 5 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 2 }, // 1 total count + 1 data retrieval
        { handler: mocks.relationListSpy, count: 2 }, // 1 constraint discovery + 1 enrichment
      ]);
      assertRootFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      // Verify relation filter applied first (constraint discovery with proper pagination offset for page 2)
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          Where.rel('relations', Where.gte('priority', 5)),
          Where.rel('relations', Where.eq('isLatest', true)),
        ],
        limit: 2,
        offset: 2, // Page 2: (2-1) * 2 = 2
      });

      // Verify root total count call (first call - index 0) - includes root filters + discovered IDs
      assertRootListQuery(
        mocks.rootListSpy,
        {
          filter: [
            Where.contains('name', 'Task'),
            Where.in('id', [1, 2, 3, 5, 6]),
          ],
          page: 1,
          limit: 1,
        },
        0,
      );

      // Verify root data retrieval call (second call - index 1) - root filters + constraint IDs
      assertRootListQuery(
        mocks.rootListSpy,
        {
          filter: [
            Where.contains('name', 'Task'),
            Where.in('id', [1, 2, 3, 5, 6]),
          ],
          page: 1,
          limit: 2,
        },
        1,
      );

      // ASSERT - Result verification
      assertResultStructure(result, { count: 2, total: 5 });
      expect(result.page).toBe(2);
      expect(result.pageCount).toBe(3);

      assertEnrichment(result, 'relations', {
        5: [{ id: 4, rootId: 5, title: 'Medium Task', priority: 5 }],
        6: [{ id: 5, rootId: 6, title: 'Important Task', priority: 6 }],
      });
    });

    it('should handle multiple root filters + relation filters with pagination', async () => {
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
            'name||$contains||Project',
            'companyId||$eq||1',
            'relations.status||$eq||active',
            'relations.priority||$gte||7',
          ],
          page: '1',
          limit: '5',
        },
        [relation],
      );

      // Test data - complex filter scenario
      const activeHighPriorityRelations = [
        {
          id: 1,
          rootId: 1,
          title: 'Critical Feature',
          status: 'active',
          priority: 10,
        },
        {
          id: 2,
          rootId: 3,
          title: 'High Priority Task',
          status: 'active',
          priority: 8,
        },
        {
          id: 3,
          rootId: 4,
          title: 'Important Feature',
          status: 'active',
          priority: 7,
        },
      ];

      const filteredProjectRoots = [
        { id: 1, name: 'Project Alpha', companyId: 1 },
        { id: 3, name: 'Project Gamma', companyId: 1 },
        { id: 4, name: 'Project Delta', companyId: 1 },
      ];

      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(activeHighPriorityRelations, { total: 3 }),
      );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(filteredProjectRoots, { limit: 5, total: 3 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 2 }, // 1 total count + 1 data retrieval
        { handler: mocks.relationListSpy, count: 2 }, // 1 constraint discovery + 1 enrichment
      ]);
      assertRootFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      // Verify relation filters applied first (AND condition, constraint discovery with limit)
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          Where.rel('relations', Where.eq('status', 'active')),
          Where.rel('relations', Where.gte('priority', 7)),
          Where.rel('relations', Where.eq('isLatest', true)),
        ],
        limit: 5,
        offset: 0,
      });

      // Verify root total count call (first call - index 0) - includes root filters + discovered IDs
      assertRootListQuery(
        mocks.rootListSpy,
        {
          filter: [
            Where.contains('name', 'Project'),
            Where.eq('companyId', 1),
            Where.in('id', [1, 3, 4]),
          ],
          page: 1,
          limit: 1,
        },
        0,
      );

      // Verify root data retrieval call (second call - index 1) - root filters + constraint IDs
      assertRootListQuery(
        mocks.rootListSpy,
        {
          filter: [
            Where.contains('name', 'Project'),
            Where.eq('companyId', 1),
            Where.in('id', [1, 3, 4]),
          ],
          page: 1,
          limit: 5,
        },
        1,
      );

      // ASSERT - Result verification
      assertResultStructure(result, { count: 3, total: 3 });
      expect(result.page).toBe(1);
      expect(result.pageCount).toBe(1);

      assertEnrichment(result, 'relations', {
        1: [
          {
            id: 1,
            rootId: 1,
            title: 'Critical Feature',
            status: 'active',
            priority: 10,
          },
        ],
        3: [
          {
            id: 2,
            rootId: 3,
            title: 'High Priority Task',
            status: 'active',
            priority: 8,
          },
        ],
        4: [
          {
            id: 3,
            rootId: 4,
            title: 'Important Feature',
            status: 'active',
            priority: 7,
          },
        ],
      });
    });

    it('should handle combined filters when results are reduced below page size', async () => {
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
            'name||$contains||Enterprise',
            'relations.status||$eq||critical',
          ],
          page: '1',
          limit: '10', // Request 10 but only 2 results match both filters
        },
        [relation],
      );

      const criticalRelations = [
        { id: 1, rootId: 2, title: 'System Outage', status: 'critical' },
        { id: 2, rootId: 5, title: 'Security Breach', status: 'critical' },
      ];

      const enterpriseRoots = [
        { id: 2, name: 'Enterprise Suite' },
        { id: 5, name: 'Enterprise Security' },
      ];

      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(criticalRelations, { total: 2 }),
      );
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(enterpriseRoots, { limit: 10, total: 2 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 2 }, // 1 total count + 1 data retrieval
        { handler: mocks.relationListSpy, count: 2 }, // 1 constraint discovery + 1 enrichment
      ]);
      assertRootFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      // Verify relation filter applied first (constraint discovery with limit)
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          Where.rel('relations', Where.eq('status', 'critical')),
          Where.rel('relations', Where.eq('isLatest', true)),
        ],
        limit: 10,
        offset: 0,
      });

      // Verify root total count call (first call - index 0) - includes root filters + discovered IDs
      assertRootListQuery(
        mocks.rootListSpy,
        {
          filter: [
            Where.contains('name', 'Enterprise'),
            Where.in('id', [2, 5]),
          ],
          page: 1,
          limit: 1,
        },
        0,
      );

      // Verify root data retrieval call (second call - index 1) - root filters + constraint IDs
      assertRootListQuery(
        mocks.rootListSpy,
        {
          filter: [
            Where.contains('name', 'Enterprise'),
            Where.in('id', [2, 5]),
          ],
          page: 1,
          limit: 10,
        },
        1,
      );

      // ASSERT - Result verification (fewer results than requested page size)
      assertResultStructure(result, { count: 2, total: 2 });
      expect(result.page).toBe(1);
      expect(result.pageCount).toBe(1);

      assertEnrichment(result, 'relations', {
        2: [{ id: 1, rootId: 2, title: 'System Outage', status: 'critical' }],
        5: [{ id: 2, rootId: 5, title: 'Security Breach', status: 'critical' }],
      });
    });
  });
});

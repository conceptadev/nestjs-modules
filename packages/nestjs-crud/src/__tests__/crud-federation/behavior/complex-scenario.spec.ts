import { Where, WhereOperator } from '@concepta/nestjs-common';

import { createPaginatedResponse } from '../fixtures/crud-federation-mock-helpers';
import {
  assertHandlerCallCounts,
  assertRootListQuery,
  assertRelationQuery,
  assertRootFirst,
  assertResultStructure,
  assertEnrichment,
  assertOneToOneEnrichment,
  assertSortOrder,
} from '../fixtures/crud-federation-test-assertions';
import {
  createOneToOneForwardRelation,
  createOneToManyForwardRelation,
} from '../fixtures/crud-federation-test-entities';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../fixtures/crud-federation-test-setup';

// Extended interfaces for complex test entities
interface TestComment {
  id: number;
  rootId: number;
  title: string;
  status: string;
  priority: number;
  isLatest: boolean;
  createdAt: string;
}

interface TestProfile {
  id: number;
  rootId: number;
  bio: string;
  isActive: boolean;
}

interface TestRoot {
  id: number;
  name: string;
  status: string;
}

/**
 * Comprehensive test scenario covering the most complex CRUD federation use case:
 * - Root service with multiple filters and mixed ASC/DESC sorts
 * - Two relations: one-to-one (profiles) and one-to-many (comments)
 * - Each relation with its own filters and sorts
 * - Large dataset with sparse relations and pagination past page 2
 * - Tests buffer strategy, constraint intersection, and enrichment
 */
describe('CrudFederationService - Complex Scenario: Multi-Relation with Pagination', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  describe('Most Complex Federation Scenario', () => {
    it('should handle root filters, relation sorts, multiple relations, and page 2 pagination', async () => {
      // ARRANGE - Complex configuration
      const profileRelation = createOneToOneForwardRelation(
        'profiles',
        'TestProfile',
        'id',
        'rootId',
      );

      const commentRelation = createOneToManyForwardRelation(
        'comments',
        'TestRelation',
        {
          distinctFilter: {
            field: 'isLatest',
            operator: WhereOperator.EQ,
            value: true,
          }, // Required for many-cardinality sort
        },
      );

      const req = await mocks.createTestQuery(
        {
          // Root filters - multiple conditions
          filter: [
            'name||$contains||Project', // Root name contains "Project"
            'status||$eq||active', // Root status equals "active"
            'profiles.isActive||$eq||true', // Profile filter
            'comments.status||$eq||published', // Comment filter 1
            'comments.priority||$gte||5', // Comment filter 2
            'comments.rootId||$nnull', // Required for relation sort
          ],
          // Mixed sorts - root sorts and relation sort
          sort: [
            'name,ASC', // Root sort 1
            'id,DESC', // Root sort 2
            'comments.priority,DESC', // Relation sort (drives strategy)
            'comments.createdAt,ASC', // Relation sort 2
          ],
          // Pagination to page 2
          page: '2',
          limit: '5',
        },
        [profileRelation, commentRelation],
      );

      // ARRANGE - Complex mock data
      const testData = createComplexTestData();

      // Mock comment service responses for sequential constraint processing
      // First call: constraint discovery with sort and filters
      mocks.relationListSpy
        .mockResolvedValueOnce(
          createPaginatedResponse(testData.page2CommentsDiscovery, {
            total: 25, // Total comments matching filters across all pages
          }),
        )
        // Second call: enrichment for final roots
        .mockResolvedValueOnce(
          createPaginatedResponse(testData.allCommentsForFinalRoots, {
            total: 15, // Comments for the specific roots returned
          }),
        );

      // Mock profile service response for enrichment
      mocks.profileListSpy.mockResolvedValue(
        createPaginatedResponse(testData.profilesForFinalRoots, {
          total: 4, // Profiles for the specific roots returned
        }),
      );

      // Mock root service response after constraint discovery
      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(testData.page2Roots, {
          limit: 5,
          total: 18, // Total roots after all constraints applied
        }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 2 }, // Multiple calls in complex scenario
        { handler: mocks.relationListSpy, count: 2 }, // constraint + enrichment
        { handler: mocks.profileListSpy, count: 2 }, // Constraint discovery + enrichment
      ]);

      // Verify root-first strategy in complex scenario
      assertRootFirst(mocks.rootListSpy, [mocks.relationListSpy]);

      // ASSERT - Comment service constraint discovery call
      assertRelationQuery(
        mocks.relationListSpy,
        {
          page: undefined, // Comment relation is driving but not first, so page is reset
          offset: 0, // Offset-based pagination starts at 0
          limit: 5, // User's limit
          sort: [
            { field: 'priority', order: 'DESC' },
            { field: 'createdAt', order: 'ASC' },
          ],
          filter: [
            Where.rel('comments', Where.eq('status', 'published')),
            Where.rel('comments', Where.gte('priority', 5)),
            Where.rel('comments', Where.notNull('rootId')),
            Where.rel('comments', Where.eq('isLatest', true)),
            Where.in('rootId', [7, 11, 22, 28]),
          ],
        },
        0,
      );

      // ASSERT - Root service total count call (call 0)
      assertRootListQuery(
        mocks.rootListSpy,
        {
          page: 1,
          limit: 1,
          filter: [
            Where.contains('name', 'Project'),
            Where.eq('status', 'active'),
            Where.in('id', [7, 11, 15, 22, 28]),
          ],
        },
        0, // Call 0: Total count
      );

      // ASSERT - Root service data retrieval call (call 1)
      assertRootListQuery(
        mocks.rootListSpy,
        {
          page: 1, // Reset to page 1 after constraint discovery
          limit: 5,
          filter: [
            Where.contains('name', 'Project'),
            Where.eq('status', 'active'),
            Where.in('id', [7, 11, 15, 22, 28]),
          ],
          sort: [
            { field: 'name', order: 'ASC' }, // Root sort 1
            { field: 'id', order: 'DESC' }, // Root sort 2
          ],
        },
        1, // Call 1: Data retrieval
      );

      // ASSERT - Comment service enrichment call (should constrain by discovered root IDs)
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            Where.rel('comments', Where.eq('status', 'published')),
            Where.rel('comments', Where.gte('priority', 5)),
            Where.rel('comments', Where.notNull('rootId')),
            Where.rel('comments', Where.eq('isLatest', true)),
            Where.rel('comments', Where.in('rootId', [7, 11, 15, 22, 28])),
          ],
        },
        1, // Call 1: Enrichment call
      );

      // ASSERT - Profile service constraint discovery call (broad filter)
      assertRelationQuery(
        mocks.profileListSpy,
        {
          filter: [Where.rel('profiles', Where.eq('isActive', true))],
        },
        0, // Call 0: Profile constraint discovery
      );

      // ASSERT - Profile service enrichment call (should have filters and root ID constraints)
      assertRelationQuery(
        mocks.profileListSpy,
        {
          filter: [
            Where.rel('profiles', Where.eq('isActive', true)),
            Where.rel('profiles', Where.in('rootId', [7, 11, 15, 22, 28])),
          ],
        },
        1, // Call 1: Profile enrichment call
      );

      // ASSERT - Result structure matches what mocks returned
      assertResultStructure(result, { count: 5, total: 18 });
      expect(result.page).toBe(2);
      expect(result.pageCount).toBe(4); // Math.ceil(18/5)

      // ASSERT - Root sort order matches what mock returned (not hardcoded IDs)
      const expectedIds = testData.page2Roots.map((root) => root.id);
      assertSortOrder(result, expectedIds);

      // ASSERT - Enrichment verification based on mock data
      // Build expected enrichment from what the mocks returned
      const expectedCommentEnrichment: Record<number, unknown[]> = {};
      const expectedProfileEnrichment: Record<number, unknown> = {};

      // Build comment enrichment expectations from mock data
      for (const root of testData.page2Roots) {
        const rootComments = testData.allCommentsForFinalRoots.filter(
          (c) => c.rootId === root.id,
        );
        expectedCommentEnrichment[root.id] = rootComments;
      }

      // Build profile enrichment expectations from mock data
      for (const root of testData.page2Roots) {
        const rootProfile = testData.profilesForFinalRoots.find(
          (p) => p.rootId === root.id,
        );
        expectedProfileEnrichment[root.id] = rootProfile || null;
      }

      assertEnrichment(result, 'comments', expectedCommentEnrichment);
      assertOneToOneEnrichment(result, 'profiles', expectedProfileEnrichment);

      // Verify all roots have relation properties initialized (even if null/empty)
      result.data.forEach((root) => {
        expect(root).toHaveProperty('comments');
        expect(root).toHaveProperty('profiles');
      });
    });

    it('should handle sparse data requiring multiple iterations', async () => {
      // ARRANGE - Minimal setup to start
      // Test INNER JOIN sparsity without relation sorting to avoid distinctFilter requirement
      const commentRelation = createOneToManyForwardRelation(
        'comments',
        'TestRelation',
        {
          distinctFilter: {
            field: 'isLatest',
            operator: WhereOperator.EQ,
            value: true,
          },
        }, // Required for many-cardinality with filters
      );

      const req = await mocks.createTestQuery(
        {
          filter: ['comments.priority||$gte||8'],
          page: '1',
          limit: '10',
        },
        [commentRelation],
      );

      // Mock sparse data - each batch has 10 comments but few unique root IDs
      // This simulates the sparse data problem where relation-driven pagination
      // returns many relation records but only a few unique root entities per page
      const constraintBatch1 = [
        {
          id: 822,
          rootId: 479,
          title: 'Security check 1',
          priority: 11,
          isLatest: true,
        },
        {
          id: 823,
          rootId: 479,
          title: 'Security check 2',
          priority: 11,
          isLatest: true,
        },
        {
          id: 824,
          rootId: 479,
          title: 'Security check 3',
          priority: 11,
          isLatest: true,
        },
        {
          id: 825,
          rootId: 479,
          title: 'Security check 4',
          priority: 11,
          isLatest: true,
        },
        {
          id: 112,
          rootId: 67,
          title: 'Feature request 1',
          priority: 10,
          isLatest: true,
        },
        {
          id: 113,
          rootId: 67,
          title: 'Feature request 2',
          priority: 10,
          isLatest: true,
        },
        {
          id: 114,
          rootId: 67,
          title: 'Feature request 3',
          priority: 10,
          isLatest: true,
        },
        {
          id: 203,
          rootId: 89,
          title: 'Critical issue 1',
          priority: 10,
          isLatest: true,
        },
        {
          id: 204,
          rootId: 89,
          title: 'Critical issue 2',
          priority: 10,
          isLatest: true,
        },
        {
          id: 205,
          rootId: 89,
          title: 'Critical issue 3',
          priority: 10,
          isLatest: true,
        },
      ];

      const constraintBatch2 = [
        {
          id: 47,
          rootId: 23,
          title: 'Bug fix 1',
          priority: 10,
          isLatest: true,
        },
        {
          id: 48,
          rootId: 23,
          title: 'Bug fix 2',
          priority: 10,
          isLatest: true,
        },
        {
          id: 49,
          rootId: 23,
          title: 'Bug fix 3',
          priority: 10,
          isLatest: true,
        },
        {
          id: 50,
          rootId: 23,
          title: 'Bug fix 4',
          priority: 10,
          isLatest: true,
        },
        {
          id: 51,
          rootId: 23,
          title: 'Bug fix 5',
          priority: 10,
          isLatest: true,
        },
        {
          id: 341,
          rootId: 156,
          title: 'Performance fix 1',
          priority: 9,
          isLatest: true,
        },
        {
          id: 342,
          rootId: 156,
          title: 'Performance fix 2',
          priority: 9,
          isLatest: true,
        },
        {
          id: 343,
          rootId: 156,
          title: 'Performance fix 3',
          priority: 9,
          isLatest: true,
        },
        {
          id: 344,
          rootId: 156,
          title: 'Performance fix 4',
          priority: 9,
          isLatest: true,
        },
        {
          id: 345,
          rootId: 156,
          title: 'Performance fix 5',
          priority: 9,
          isLatest: true,
        },
      ];

      const constraintBatch3 = [
        {
          id: 389,
          rootId: 201,
          title: 'Security patch 1',
          priority: 9,
          isLatest: true,
        },
        {
          id: 390,
          rootId: 201,
          title: 'Security patch 2',
          priority: 9,
          isLatest: true,
        },
        {
          id: 391,
          rootId: 201,
          title: 'Security patch 3',
          priority: 9,
          isLatest: true,
        },
        {
          id: 392,
          rootId: 201,
          title: 'Security patch 4',
          priority: 9,
          isLatest: true,
        },
        {
          id: 393,
          rootId: 201,
          title: 'Security patch 5',
          priority: 9,
          isLatest: true,
        },
        {
          id: 421,
          rootId: 234,
          title: 'UI improvement 1',
          priority: 9,
          isLatest: true,
        },
        {
          id: 422,
          rootId: 234,
          title: 'UI improvement 2',
          priority: 9,
          isLatest: true,
        },
        {
          id: 423,
          rootId: 234,
          title: 'UI improvement 3',
          priority: 9,
          isLatest: true,
        },
        {
          id: 424,
          rootId: 234,
          title: 'UI improvement 4',
          priority: 9,
          isLatest: true,
        },
        {
          id: 425,
          rootId: 234,
          title: 'UI improvement 5',
          priority: 9,
          isLatest: true,
        },
      ];

      const constraintBatch4 = [
        {
          id: 534,
          rootId: 298,
          title: 'Documentation 1',
          priority: 8,
          isLatest: true,
        },
        {
          id: 535,
          rootId: 298,
          title: 'Documentation 2',
          priority: 8,
          isLatest: true,
        },
        {
          id: 536,
          rootId: 298,
          title: 'Documentation 3',
          priority: 8,
          isLatest: true,
        },
        {
          id: 537,
          rootId: 298,
          title: 'Documentation 4',
          priority: 8,
          isLatest: true,
        },
        {
          id: 538,
          rootId: 298,
          title: 'Documentation 5',
          priority: 8,
          isLatest: true,
        },
        {
          id: 539,
          rootId: 298,
          title: 'Documentation 6',
          priority: 8,
          isLatest: true,
        },
        {
          id: 540,
          rootId: 298,
          title: 'Documentation 7',
          priority: 8,
          isLatest: true,
        },
        {
          id: 541,
          rootId: 298,
          title: 'Documentation 8',
          priority: 8,
          isLatest: true,
        },
        {
          id: 542,
          rootId: 298,
          title: 'Documentation 9',
          priority: 8,
          isLatest: true,
        },
        {
          id: 543,
          rootId: 298,
          title: 'Documentation 10',
          priority: 8,
          isLatest: true,
        },
      ];

      const constraintBatch5 = [
        {
          id: 612,
          rootId: 345,
          title: 'API enhancement 1',
          priority: 8,
          isLatest: true,
        },
        {
          id: 614,
          rootId: 345,
          title: 'API enhancement 3',
          priority: 8,
          isLatest: true,
        },
        {
          id: 687,
          rootId: 389,
          title: 'Database optimization 1',
          priority: 8,
          isLatest: true,
        },
        {
          id: 688,
          rootId: 389,
          title: 'Database optimization 2',
          priority: 8,
          isLatest: true,
        },
        {
          id: 689,
          rootId: 389,
          title: 'Database optimization 3',
          priority: 8,
          isLatest: true,
        },
        {
          id: 734,
          rootId: 412,
          title: 'Testing improvements 1',
          priority: 8,
          isLatest: true,
        },
        {
          id: 735,
          rootId: 412,
          title: 'Testing improvements 2',
          priority: 8,
          isLatest: true,
        },
      ];

      const allMatchingComments = [
        ...constraintBatch1,
        ...constraintBatch2,
        ...constraintBatch3,
        ...constraintBatch4,
        ...constraintBatch5,
      ];

      const totalComments = 500; // Large total to ensure service continues iterations

      mocks.relationListSpy
        .mockResolvedValueOnce(
          createPaginatedResponse(constraintBatch1, {
            total: totalComments,
            limit: 10,
          }),
        )
        .mockResolvedValueOnce(
          createPaginatedResponse(constraintBatch2, {
            total: totalComments,
            limit: 10,
          }),
        )
        .mockResolvedValueOnce(
          createPaginatedResponse(constraintBatch3, {
            total: totalComments,
            limit: 10,
          }),
        )
        .mockResolvedValueOnce(
          createPaginatedResponse(constraintBatch4, {
            total: totalComments,
            limit: 10,
          }),
        )
        .mockResolvedValueOnce(
          createPaginatedResponse(constraintBatch5, {
            total: totalComments,
            limit: 10,
          }),
        )
        .mockResolvedValueOnce(
          createPaginatedResponse([], { total: totalComments, limit: 10 }),
        ) // Empty - no more results
        .mockResolvedValueOnce(
          createPaginatedResponse(allMatchingComments, {
            total: allMatchingComments.length,
          }),
        ); // Enrichment

      // Add root service mock with corresponding roots
      const correspondingRoots = [
        { id: 23, name: 'Project Alpha', status: 'active' },
        { id: 67, name: 'Project Beta', status: 'active' },
        { id: 89, name: 'Project Gamma', status: 'active' },
        { id: 156, name: 'Project Delta', status: 'active' },
        { id: 201, name: 'Project Epsilon', status: 'active' },
        { id: 234, name: 'Project Zeta', status: 'active' },
        { id: 298, name: 'Project Eta', status: 'active' },
        { id: 345, name: 'Project Theta', status: 'active' },
        { id: 389, name: 'Project Iota', status: 'active' },
        { id: 412, name: 'Project Kappa', status: 'active' },
        { id: 479, name: 'Project Toomuch', status: 'active' },
      ];

      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(correspondingRoots, { total: 1000 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call counts (should be much cleaner now)
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 }, // Single call with accumulated root IDs
        { handler: mocks.relationListSpy, count: 6 }, // 5 constraint discovery + 1 enrichment
      ]);

      // ASSERT - Comment service constraint discovery call (first iteration, unconstrained)
      assertRelationQuery(
        mocks.relationListSpy,
        {
          offset: 0,
          limit: 10,
          filter: [
            Where.rel('comments', Where.gte('priority', 8)),
            Where.rel('comments', Where.eq('isLatest', true)),
          ],
        },
        0,
      );

      // ASSERT - Comment service constraint discovery calls (iterations 1-4)
      assertRelationQuery(
        mocks.relationListSpy,
        {
          offset: 10,
          limit: 10,
          filter: [
            Where.rel('comments', Where.gte('priority', 8)),
            Where.rel('comments', Where.eq('isLatest', true)),
          ],
        },
        1, // Call 1: Iteration 2
      );

      assertRelationQuery(
        mocks.relationListSpy,
        {
          offset: 20,
          limit: 10,
          filter: [
            Where.rel('comments', Where.gte('priority', 8)),
            Where.rel('comments', Where.eq('isLatest', true)),
          ],
        },
        2, // Call 2: Iteration 3
      );

      assertRelationQuery(
        mocks.relationListSpy,
        {
          offset: 30,
          limit: 10,
          filter: [
            Where.rel('comments', Where.gte('priority', 8)),
            Where.rel('comments', Where.eq('isLatest', true)),
          ],
        },
        3, // Call 3: Iteration 4
      );

      assertRelationQuery(
        mocks.relationListSpy,
        {
          offset: 40,
          limit: 10,
          filter: [
            Where.rel('comments', Where.gte('priority', 8)),
            Where.rel('comments', Where.eq('isLatest', true)),
          ],
        },
        4, // Call 4: Iteration 5
      );

      // ASSERT - Comment service enrichment call (final call with discovered root IDs)
      assertRelationQuery(
        mocks.relationListSpy,
        {
          filter: [
            Where.rel('comments', Where.gte('priority', 8)),
            Where.rel('comments', Where.eq('isLatest', true)),
            Where.rel(
              'comments',
              Where.in(
                'rootId',
                [479, 67, 89, 23, 156, 201, 234, 298, 345, 389],
              ),
            ),
          ],
        },
        5, // Call 5: Enrichment
      );

      // ASSERT - Root service data retrieval call (single call with all accumulated root IDs)
      assertRootListQuery(
        mocks.rootListSpy,
        {
          page: 1,
          limit: 10,
          filter: [
            Where.in(
              'id',
              [479, 67, 89, 23, 156, 201, 234, 298, 345, 389, 412],
            ),
          ],
        },
        0, // Call 0: Data retrieval (no total count call in this scenario)
      );

      // ASSERT - Result structure (accumulated root IDs from multiple iterations)
      expect(result.data).toHaveLength(10);
      expect(result.total).toBe(500); // Total from first relation query
      expect(result.count).toBe(10); // 10 roots returned

      // ASSERT - Basic enrichment check
      result.data.forEach((root) => {
        expect(root).toHaveProperty('comments');
        expect(Array.isArray(root.comments)).toBe(true);
      });
    });
  });
});

// Complex test data builders
function createComplexTestData() {
  return {
    // Page 2 comment discovery - comments that drive the sort order
    page2CommentsDiscovery: [
      {
        id: 25,
        rootId: 7,
        title: 'Critical Issue',
        status: 'published',
        priority: 10,
        isLatest: true,
        createdAt: '2024-01-15',
      },
      {
        id: 41,
        rootId: 11,
        title: 'High Priority Task',
        status: 'published',
        priority: 9,
        isLatest: true,
        createdAt: '2024-01-12',
      },
      {
        id: 55,
        rootId: 15,
        title: 'Important Feature',
        status: 'published',
        priority: 8,
        isLatest: true,
        createdAt: '2024-01-10',
      },
      {
        id: 72,
        rootId: 22,
        title: 'Security Update',
        status: 'published',
        priority: 7,
        isLatest: true,
        createdAt: '2024-01-08',
      },
      {
        id: 88,
        rootId: 28,
        title: 'Performance Fix',
        status: 'published',
        priority: 6,
        isLatest: true,
        createdAt: '2024-01-05',
      },
    ] as TestComment[],

    // All comments for the final roots (for enrichment)
    allCommentsForFinalRoots: [
      {
        id: 25,
        rootId: 7,
        title: 'Critical Issue',
        status: 'published',
        priority: 10,
        isLatest: true,
        createdAt: '2024-01-15',
      },
      {
        id: 26,
        rootId: 7,
        title: 'Old Issue',
        status: 'published',
        priority: 8,
        isLatest: false,
        createdAt: '2024-01-01',
      },
      {
        id: 41,
        rootId: 11,
        title: 'High Priority Task',
        status: 'published',
        priority: 9,
        isLatest: true,
        createdAt: '2024-01-12',
      },
      {
        id: 55,
        rootId: 15,
        title: 'Important Feature',
        status: 'published',
        priority: 8,
        isLatest: true,
        createdAt: '2024-01-10',
      },
      {
        id: 56,
        rootId: 15,
        title: 'Minor Update',
        status: 'draft',
        priority: 3,
        isLatest: false,
        createdAt: '2024-01-03',
      },
      {
        id: 72,
        rootId: 22,
        title: 'Security Update',
        status: 'published',
        priority: 7,
        isLatest: true,
        createdAt: '2024-01-08',
      },
      {
        id: 88,
        rootId: 28,
        title: 'Performance Fix',
        status: 'published',
        priority: 6,
        isLatest: true,
        createdAt: '2024-01-05',
      },
    ] as TestComment[],

    // Page 2 roots after constraint discovery
    page2Roots: [
      { id: 7, name: 'Project Alpha', status: 'active' },
      { id: 11, name: 'Project Beta', status: 'active' },
      { id: 15, name: 'Project Charlie', status: 'active' },
      { id: 22, name: 'Project Delta', status: 'active' },
      { id: 28, name: 'Project Echo', status: 'active' },
    ] as TestRoot[],

    // Profiles for the final roots (sparse - not all roots have profiles)
    profilesForFinalRoots: [
      { id: 7, rootId: 7, bio: 'Senior Developer Profile', isActive: true },
      { id: 11, rootId: 11, bio: 'Team Lead Profile', isActive: true },
      // Root 15 has no active profile
      { id: 22, rootId: 22, bio: 'Product Manager Profile', isActive: true },
      { id: 28, rootId: 28, bio: 'DevOps Engineer Profile', isActive: true },
    ] as TestProfile[],
  };
}

import { Where } from '@concepta/nestjs-common';

import { createPaginatedResponse } from '../../../__fixtures__/crud/mocks/crud-paginated-response.mock';
import {
  assertHandlerCallCounts,
  assertResultStructure,
  assertOneToOneEnrichment,
  assertRootFirst,
  assertLeftJoinBehavior,
  assertRootListQuery,
  assertRelationQuery,
} from '../fixtures/crud-federation-test-assertions';
import { createMultiRelationSet } from '../fixtures/crud-federation-test-data';
import {
  createOneToOneForwardRelation,
  TestProfile,
  TestSettings,
} from '../fixtures/crud-federation-test-entities';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../fixtures/crud-federation-test-setup';

/**
 * Integration tests for one-to-one forward relationship behavior
 * One-to-one forward relationships: Profile.rootId -> Root.id (Root.profile)
 * Focuses on service coordination for single entity enrichment
 */
describe('CrudFederationService - Integration: One-to-One Forward Relationships', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  describe('Root with existing related entity', () => {
    it('should populate profile entity object on root (LEFT JOIN)', async () => {
      // ARRANGE
      const relation = createOneToOneForwardRelation('profile', 'TestProfile');
      const req = await mocks.createTestQuery({ page: '1', limit: '10' }, [
        relation,
      ]);

      // Use data helper for consistent test data
      const data = createMultiRelationSet();
      const rootData = data.roots;
      const profileData = data.profiles;

      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(rootData, { limit: 10, total: 2 }),
      );
      mocks.profileListSpy.mockResolvedValue(
        createPaginatedResponse(profileData, { total: 1 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.profileListSpy, count: 1 },
      ]);
      assertRootFirst(mocks.rootListSpy, [mocks.profileListSpy]);
      assertLeftJoinBehavior(mocks.rootListSpy);

      // Verify root service parameters
      assertRootListQuery(mocks.rootListSpy, {
        page: 1,
        limit: 10,
      });

      // Verify profile handler called with root IDs
      assertRelationQuery(mocks.profileListSpy, {
        filter: [Where.rel('profile', Where.in('rootId', [1, 2]))],
      });

      // ASSERT - Result verification
      assertResultStructure(result, { count: 2, total: 2 });
      assertOneToOneEnrichment(result, 'profile', {
        1: {
          id: 1,
          rootId: 1,
          bio: 'Profile 1',
          avatar: 'avatar1.jpg',
        },
        2: null,
      });
    });
  });

  describe('Root with missing related entity', () => {
    it('should populate null profile object on root, root still included (LEFT JOIN)', async () => {
      // ARRANGE
      const relation = createOneToOneForwardRelation('profile', 'TestProfile');
      const req = await mocks.createTestQuery({ page: '1', limit: '10' }, [
        relation,
      ]);

      // Use data helper for consistent test data
      const data = createMultiRelationSet();
      const rootData = data.roots;
      const profileData: TestProfile[] = []; // No profiles for this test

      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(rootData, { limit: 10, total: 2 }),
      );
      mocks.profileListSpy.mockResolvedValue(
        createPaginatedResponse(profileData, { total: 0 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.profileListSpy, count: 1 },
      ]);
      assertRootFirst(mocks.rootListSpy, [mocks.profileListSpy]);
      assertLeftJoinBehavior(mocks.rootListSpy);

      // Verify root service parameters
      assertRootListQuery(mocks.rootListSpy, {
        page: 1,
        limit: 10,
      });

      // Verify profile handler called with root IDs
      assertRelationQuery(mocks.profileListSpy, {
        filter: [Where.rel('profile', Where.in('rootId', [1, 2]))],
      });

      // ASSERT - Result verification (LEFT JOIN: all roots returned with null profiles)
      assertResultStructure(result, { count: 2, total: 2 });
      assertOneToOneEnrichment(result, 'profile', {
        1: null,
        2: null,
      });
    });
  });

  describe('Root with multiple relationships', () => {
    it('should handle multiple one-to-one forward relationships correctly (LEFT JOIN)', async () => {
      // ARRANGE
      const profileRelation = createOneToOneForwardRelation(
        'profile',
        'TestProfile',
      );
      const settingsRelation = createOneToOneForwardRelation(
        'settings',
        'TestSettings',
      );
      const req = await mocks.createTestQuery({ page: '1', limit: '10' }, [
        profileRelation,
        settingsRelation,
      ]);

      // Use data helper for consistent test data
      const data = createMultiRelationSet();
      // Extend with additional roots for this test
      const rootData = [
        ...data.roots,
        { id: 3, name: 'Root 3' },
        { id: 4, name: 'Root 4' },
        { id: 5, name: 'Root 5' },
      ];

      // Custom profile and settings data for this complex scenario
      const profileData: TestProfile[] = [
        { id: 1, rootId: 1, bio: 'Profile 1', avatar: 'avatar1.jpg' }, // from data helper
        { id: 2, rootId: 3, bio: 'Profile for Root 3' },
        {
          id: 3,
          rootId: 4,
          bio: 'Profile for Root 4',
          avatar: 'avatar4.jpg',
        },
        // Roots 2 and 5 have no profiles
      ];

      const settingsData: TestSettings[] = [
        { id: 1, rootId: 1, theme: 'dark', notifications: true }, // from data helper
        { id: 2, rootId: 2, theme: 'light', notifications: false }, // from data helper
        { id: 3, rootId: 5, theme: 'auto', notifications: true },
        // Roots 3 and 4 have no settings
      ];

      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(rootData, { limit: 10, total: 5 }),
      );
      mocks.profileListSpy.mockResolvedValue(
        createPaginatedResponse(profileData, { total: 3 }),
      );
      mocks.settingsListSpy.mockResolvedValue(
        createPaginatedResponse(settingsData, { total: 3 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.profileListSpy, count: 1 },
        { handler: mocks.settingsListSpy, count: 1 },
      ]);
      assertRootFirst(mocks.rootListSpy, [
        mocks.profileListSpy,
        mocks.settingsListSpy,
      ]);
      assertLeftJoinBehavior(mocks.rootListSpy);

      // Verify root service parameters
      assertRootListQuery(mocks.rootListSpy, {
        page: 1,
        limit: 10,
      });

      // Verify profile handler called with all root IDs
      assertRelationQuery(mocks.profileListSpy, {
        filter: [Where.rel('profile', Where.in('rootId', [1, 2, 3, 4, 5]))],
      });

      // Verify settings handler called with all root IDs
      assertRelationQuery(mocks.settingsListSpy, {
        filter: [Where.rel('settings', Where.in('rootId', [1, 2, 3, 4, 5]))],
      });

      // ASSERT - Result verification
      assertResultStructure(result, { count: 5, total: 5 });

      // Verify profile enrichment
      assertOneToOneEnrichment(result, 'profile', {
        1: { id: 1, rootId: 1, bio: 'Profile 1', avatar: 'avatar1.jpg' },
        2: null,
        3: { id: 2, rootId: 3, bio: 'Profile for Root 3' },
        4: {
          id: 3,
          rootId: 4,
          bio: 'Profile for Root 4',
          avatar: 'avatar4.jpg',
        },
        5: null,
      });

      // Verify settings enrichment
      assertOneToOneEnrichment(result, 'settings', {
        1: { id: 1, rootId: 1, theme: 'dark', notifications: true },
        2: { id: 2, rootId: 2, theme: 'light', notifications: false },
        3: null,
        4: null,
        5: { id: 3, rootId: 5, theme: 'auto', notifications: true },
      });
    });
  });

  describe('Pagination handling', () => {
    it('should handle page 1 pagination with profile enrichment (LEFT JOIN)', async () => {
      // ARRANGE
      const relation = createOneToOneForwardRelation('profile', 'TestProfile');
      const req = await mocks.createTestQuery({ page: '1', limit: '5' }, [
        relation,
      ]);

      // Create test data for pagination - page 1 (roots 1-5)
      const rootData = [
        { id: 1, name: 'Root 1' },
        { id: 2, name: 'Root 2' },
        { id: 3, name: 'Root 3' },
        { id: 4, name: 'Root 4' },
        { id: 5, name: 'Root 5' },
      ];

      const profileData: TestProfile[] = [
        {
          id: 1,
          rootId: 1,
          bio: 'Profile for Root 1',
          avatar: 'avatar1.jpg',
        },
        { id: 2, rootId: 3, bio: 'Profile for Root 3' },
        {
          id: 3,
          rootId: 5,
          bio: 'Profile for Root 5',
          avatar: 'avatar5.jpg',
        },
        // Roots 2 and 4 have no profiles
      ];

      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(rootData, { limit: 5, total: 10 }),
      );
      mocks.profileListSpy.mockResolvedValue(
        createPaginatedResponse(profileData, { total: 3 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.profileListSpy, count: 1 },
      ]);
      assertRootFirst(mocks.rootListSpy, [mocks.profileListSpy]);
      assertLeftJoinBehavior(mocks.rootListSpy);

      // Verify root service parameters
      assertRootListQuery(mocks.rootListSpy, {
        page: 1,
        limit: 5,
      });

      // Verify root pagination parameters
      assertRootListQuery(mocks.rootListSpy, {
        page: 1,
        limit: 5,
      });

      // Verify profile handler called with page 1 root IDs
      assertRelationQuery(mocks.profileListSpy, {
        filter: [Where.rel('profile', Where.in('rootId', [1, 2, 3, 4, 5]))],
      });

      // ASSERT - Result verification
      assertResultStructure(result, { count: 5, total: 10 });
      expect(result.page).toBe(1);
      expect(result.pageCount).toBe(2);

      // Verify profile enrichment for page 1
      assertOneToOneEnrichment(result, 'profile', {
        1: {
          id: 1,
          rootId: 1,
          bio: 'Profile for Root 1',
          avatar: 'avatar1.jpg',
        },
        2: null,
        3: { id: 2, rootId: 3, bio: 'Profile for Root 3' },
        4: null,
        5: {
          id: 3,
          rootId: 5,
          bio: 'Profile for Root 5',
          avatar: 'avatar5.jpg',
        },
      });
    });

    it('should handle page 2 pagination with profile enrichment (LEFT JOIN)', async () => {
      // ARRANGE
      const relation = createOneToOneForwardRelation('profile', 'TestProfile');
      const req = await mocks.createTestQuery({ page: '2', limit: '5' }, [
        relation,
      ]);

      // Create test data for pagination - page 2 (roots 6-10)
      const rootData = [
        { id: 6, name: 'Root 6' },
        { id: 7, name: 'Root 7' },
        { id: 8, name: 'Root 8' },
        { id: 9, name: 'Root 9' },
        { id: 10, name: 'Root 10' },
      ];

      const profileData: TestProfile[] = [
        { id: 4, rootId: 6, bio: 'Profile for Root 6' },
        {
          id: 5,
          rootId: 8,
          bio: 'Profile for Root 8',
          avatar: 'avatar8.jpg',
        },
        {
          id: 6,
          rootId: 10,
          bio: 'Profile for Root 10',
          avatar: 'avatar10.jpg',
        },
        // Roots 7 and 9 have no profiles
      ];

      mocks.rootListSpy.mockResolvedValue(
        createPaginatedResponse(rootData, { limit: 5, total: 10 }),
      );
      mocks.profileListSpy.mockResolvedValue(
        createPaginatedResponse(profileData, { total: 3 }),
      );

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Handler call verification
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 1 },
        { handler: mocks.profileListSpy, count: 1 },
      ]);
      assertRootFirst(mocks.rootListSpy, [mocks.profileListSpy]);
      assertLeftJoinBehavior(mocks.rootListSpy);

      // Verify root service parameters
      assertRootListQuery(mocks.rootListSpy, {
        page: 2,
        limit: 5,
      });

      // Verify root pagination parameters
      assertRootListQuery(mocks.rootListSpy, {
        page: 2,
        limit: 5,
      });

      // Verify profile handler called with page 2 root IDs
      assertRelationQuery(mocks.profileListSpy, {
        filter: [Where.rel('profile', Where.in('rootId', [6, 7, 8, 9, 10]))],
      });

      // ASSERT - Result verification
      assertResultStructure(result, { count: 5, total: 10 });
      expect(result.page).toBe(2);
      expect(result.pageCount).toBe(2);

      // Verify profile enrichment for page 2
      assertOneToOneEnrichment(result, 'profile', {
        6: { id: 4, rootId: 6, bio: 'Profile for Root 6' },
        7: null,
        8: {
          id: 5,
          rootId: 8,
          bio: 'Profile for Root 8',
          avatar: 'avatar8.jpg',
        },
        9: null,
        10: {
          id: 6,
          rootId: 10,
          bio: 'Profile for Root 10',
          avatar: 'avatar10.jpg',
        },
      });
    });
  });
});

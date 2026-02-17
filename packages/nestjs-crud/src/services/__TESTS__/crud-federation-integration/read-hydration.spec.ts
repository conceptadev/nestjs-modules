import { Where } from '@concepta/nestjs-common';

import { createPaginatedResponse } from '../../__FIXTURES__/crud-federation-mock-helpers';
import {
  assertRelationQuery,
  assertRootFirst,
  assertRootReadQuery,
} from '../../__FIXTURES__/crud-federation-test-assertions';
import {
  createMinimalRootRelationSet,
  createSingleEntitySet,
  createMultiRelationSet,
} from '../../__FIXTURES__/crud-federation-test-data';
import {
  createOneToManyForwardRelation,
  createOneToOneForwardRelation,
} from '../../__FIXTURES__/crud-federation-test-entities';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../../__FIXTURES__/crud-federation-test-setup';

/**
 * Integration tests for read federation with relation hydration
 * Tests single entity fetching with relation hydration support
 */
describe('CrudFederationService - Integration: read Hydration', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  describe('no relations', () => {
    it('should fetch single root without relations', async () => {
      // ARRANGE
      const data = createSingleEntitySet();
      mocks.rootReadSpy.mockResolvedValue(data.roots[0]);

      const req = await mocks.createTestQuery({});

      // ACT
      const result = await mocks.service.read(req);

      // ASSERT
      expect(result).toEqual(data.roots[0]);
      expect(mocks.rootReadSpy).toHaveBeenCalledTimes(1);
      expect(mocks.relationListSpy).toHaveBeenCalledTimes(0);

      // Verify root service was called with correct parameters
      assertRootReadQuery(mocks.rootReadSpy, {});
    });
  });

  describe('one-to-one forward relation', () => {
    it('should hydrate existing one-to-one relation', async () => {
      // ARRANGE
      const data = createMinimalRootRelationSet();
      mocks.rootReadSpy.mockResolvedValue(data.roots[0]);
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse([data.relations[0]], { total: 1 }),
      );

      const relation = createOneToOneForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery({}, [relation]);

      // ACT
      const result = await mocks.service.read(req);

      // ASSERT
      expect(result.id).toBe(1);

      // Handler call verification
      expect(mocks.rootReadSpy).toHaveBeenCalledTimes(1);
      expect(mocks.relationListSpy).toHaveBeenCalledTimes(1);
      assertRootFirst(mocks.rootReadSpy, [mocks.relationListSpy]);

      // Verify root service was called with correct parameters
      assertRootReadQuery(mocks.rootReadSpy, {});

      // Verify relation service was called with correct filter
      assertRelationQuery(mocks.relationListSpy, {
        filter: [Where.rel('relations', Where.eq('rootId', 1))],
      });

      // Verify enrichment - the relation should be attached to the root
      expect(result.relations).toEqual(data.relations[0]);
    });

    it('should handle missing one-to-one relation', async () => {
      // ARRANGE
      const data = createSingleEntitySet();
      mocks.rootReadSpy.mockResolvedValue(data.roots[0]);
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse([], { total: 0 }),
      );

      const relation = createOneToOneForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery({}, [relation]);

      // ACT
      const result = await mocks.service.read(req);

      // ASSERT
      expect(result.id).toBe(1);

      // Handler call verification
      expect(mocks.rootReadSpy).toHaveBeenCalledTimes(1);
      expect(mocks.relationListSpy).toHaveBeenCalledTimes(1);
      assertRootFirst(mocks.rootReadSpy, [mocks.relationListSpy]);

      // Verify root service was called with correct parameters
      assertRootReadQuery(mocks.rootReadSpy, {});

      // Verify relation service was called with correct filter and NO limit
      assertRelationQuery(mocks.relationListSpy, {
        filter: [Where.rel('relations', Where.eq('rootId', 1))],
      });

      // Verify enrichment - relation should be null when missing
      expect(result.relations).toBeNull();
    });
  });

  describe('one-to-many forward relation', () => {
    it('should hydrate multiple one-to-many relations', async () => {
      // ARRANGE
      const data = createMultiRelationSet();
      mocks.rootReadSpy.mockResolvedValue(data.roots[0]);
      // Create test data with multiple relations for root 1
      const multipleRelations = [
        { id: 1, rootId: 1, title: 'Relation 1' },
        { id: 2, rootId: 1, title: 'Relation 2' },
      ];
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(multipleRelations, { total: 2 }),
      );

      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery({}, [relation]);

      // ACT
      const result = await mocks.service.read(req);

      // ASSERT
      expect(result.id).toBe(1);

      // Handler call verification
      expect(mocks.rootReadSpy).toHaveBeenCalledTimes(1);
      expect(mocks.relationListSpy).toHaveBeenCalledTimes(1);
      assertRootFirst(mocks.rootReadSpy, [mocks.relationListSpy]);

      // Verify root service was called with correct parameters
      assertRootReadQuery(mocks.rootReadSpy, {});

      // Verify relation service was called with correct filter and NO limit
      assertRelationQuery(mocks.relationListSpy, {
        filter: [Where.rel('relations', Where.eq('rootId', 1))],
      });

      // Verify enrichment - the relations array should be properly attached
      expect(result.relations).toEqual(multipleRelations);
    });

    it('should handle empty one-to-many relation', async () => {
      // ARRANGE
      const data = createSingleEntitySet();
      mocks.rootReadSpy.mockResolvedValue(data.roots[0]);
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse([], { total: 0 }),
      );

      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery({}, [relation]);

      // ACT
      const result = await mocks.service.read(req);

      // ASSERT
      expect(result.id).toBe(1);

      // Handler call verification
      expect(mocks.rootReadSpy).toHaveBeenCalledTimes(1);
      expect(mocks.relationListSpy).toHaveBeenCalledTimes(1);
      assertRootFirst(mocks.rootReadSpy, [mocks.relationListSpy]);

      // Verify root service was called with correct parameters
      assertRootReadQuery(mocks.rootReadSpy, {});

      // Verify relation service was called with correct filter and NO limit
      assertRelationQuery(mocks.relationListSpy, {
        filter: [Where.rel('relations', Where.eq('rootId', 1))],
      });

      // Verify enrichment - empty relations array
      expect(result.relations).toEqual([]);
    });
  });

  describe('mixed relation types', () => {
    it('should hydrate both one-to-one and one-to-many relations', async () => {
      // ARRANGE
      const data = createMultiRelationSet();
      mocks.rootReadSpy.mockResolvedValue(data.roots[0]);

      // Mock profile service (one-to-one)
      mocks.profileListSpy.mockResolvedValue(
        createPaginatedResponse([data.profiles[0]], { total: 1 }),
      );

      // Mock relation service (one-to-many) - create multiple relations for root 1
      const multipleRelations = [
        { id: 1, rootId: 1, title: 'Relation 1' },
        { id: 2, rootId: 1, title: 'Relation 2' },
      ];
      mocks.relationListSpy.mockResolvedValue(
        createPaginatedResponse(multipleRelations, { total: 2 }),
      );

      const profileRelation = createOneToOneForwardRelation(
        'profile',
        'TestProfile',
      );
      const relationRelation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery({}, [
        profileRelation,
        relationRelation,
      ]);

      // ACT
      const result = await mocks.service.read(req);

      // ASSERT
      expect(result.id).toBe(1);

      // Handler call verification
      expect(mocks.rootReadSpy).toHaveBeenCalledTimes(1);
      expect(mocks.profileListSpy).toHaveBeenCalledTimes(1);
      expect(mocks.relationListSpy).toHaveBeenCalledTimes(1);
      assertRootFirst(mocks.rootReadSpy, [
        mocks.profileListSpy,
        mocks.relationListSpy,
      ]);

      // Verify root service was called with correct parameters
      assertRootReadQuery(mocks.rootReadSpy, {});

      // Verify profile service was called with correct filter and NO limit
      assertRelationQuery(mocks.profileListSpy, {
        filter: [Where.rel('profile', Where.eq('rootId', 1))],
      });

      // Verify relation service was called with correct filter and NO limit
      assertRelationQuery(mocks.relationListSpy, {
        filter: [Where.rel('relations', Where.eq('rootId', 1))],
      });

      // Verify enrichment - both relations should be properly attached
      expect(result.profile).toEqual(data.profiles[0]);
      expect(result.relations).toEqual(multipleRelations);
    });
  });

  describe('null foreign key handling', () => {
    it('should handle null foreign key in forward relationship', async () => {
      // ARRANGE
      const rootWithNullForeignKey = {
        id: 1,
        name: 'Only Root',
        profileId: null,
      };

      mocks.rootReadSpy.mockResolvedValue(rootWithNullForeignKey);
      mocks.profileListSpy.mockResolvedValue(
        createPaginatedResponse([], { total: 0 }),
      );

      // Create forward relation but this root has no profile, so it should return null
      const relation = createOneToOneForwardRelation('profile', 'TestProfile');
      const context = await mocks.createTestQuery({}, [relation]);

      // ACT
      const result = await mocks.service.read(context);

      // ASSERT
      expect(result.id).toBe(1);

      // Handler call verification
      expect(mocks.rootReadSpy).toHaveBeenCalledTimes(1);
      expect(mocks.profileListSpy).toHaveBeenCalledTimes(1);
      assertRootFirst(mocks.rootReadSpy, [mocks.profileListSpy]);

      // Verify root service was called with correct parameters
      assertRootReadQuery(mocks.rootReadSpy, {});

      // Verify profile service was called with correct filter and NO limit
      assertRelationQuery(mocks.profileListSpy, {
        filter: [Where.rel('profile', Where.eq('rootId', 1))],
      });

      // Verify enrichment - profile should be null for null foreign key
      expect(result.profile).toBeNull();
    });
  });
});

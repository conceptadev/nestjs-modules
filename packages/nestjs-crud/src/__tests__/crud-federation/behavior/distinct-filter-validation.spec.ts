import { WhereOperator } from '@concepta/nestjs-common';

import { CrudFederationException } from '../../../infrastructure/exceptions/crud-federation.exception';
import { assertRelationQuery } from '../fixtures/crud-federation-test-assertions';
import {
  createOneToManyForwardRelation,
  createOneToOneForwardRelation,
} from '../fixtures/crud-federation-test-entities';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../fixtures/crud-federation-test-setup';

/**
 * Validation tests for distinctFilter requirements on many-cardinality relations
 * Tests that relation sorting requires distinctFilter for many relationships
 */
describe('CrudFederationService - Behavior: distinctFilter Validation', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  describe('distinctFilter requirement validation', () => {
    it('should throw error when many-cardinality relation lacks distinctFilter', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      // Remove distinctFilter to test validation
      const req = await mocks.createTestQuery(
        {
          sort: ['relations.title,ASC'], // Trying to sort by relation field
        },
        [relation],
      );

      // ACT & ASSERT
      const error = await mocks.service.list(req).catch((e) => e);

      expect(error).toBeInstanceOf(CrudFederationException);
      expect(error.message).toContain(
        'requires a distinctFilter configuration',
      );
      expect(error.message).toContain('many-cardinality relationship');
    });

    it('should succeed when many-cardinality relation has distinctFilter and $nnull', async () => {
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
          sort: ['relations.title,ASC'], // Sorting by relation field
          limit: '3',
        },
        [relation],
      );

      // Mock data
      const relationData = [
        { id: 1, rootId: 1, title: 'Alpha Task', isLatest: true },
        { id: 2, rootId: 2, title: 'Beta Task', isLatest: true },
        { id: 3, rootId: 3, title: 'Charlie Task', isLatest: true },
      ];
      const rootData = [
        { id: 1, name: 'Root 1' },
        { id: 2, name: 'Root 2' },
        { id: 3, name: 'Root 3' },
      ];

      mocks.relationListSpy.mockResolvedValue({
        data: relationData,
        count: 3,
        total: 3,
        page: 1,
        pageCount: 1,
        limit: 3,
      });

      mocks.rootListSpy.mockResolvedValue({
        data: rootData,
        count: 3,
        total: 3,
        page: 1,
        pageCount: 1,
        limit: 3,
      });

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);

      // Verify distinctFilter was applied
      assertRelationQuery(mocks.relationListSpy, {
        filter: [
          {
            field: 'rootId',
            operator: WhereOperator.NOT_NULL,
            relation: 'relations',
          },
          {
            field: 'isLatest',
            operator: WhereOperator.EQ,
            value: true,
            relation: 'relations',
          },
        ],
        limit: 3,
        offset: 0,
        sort: [{ field: 'title', order: 'ASC' }],
      });
    });

    it('should automatically inject $nnull filter for relation sorting', async () => {
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
          // No $nnull filter provided - system should inject it automatically
          sort: ['relations.title,ASC'],
        },
        [relation],
      );

      // Mock data
      mocks.relationListSpy.mockResolvedValue({
        data: [{ id: 1, rootId: 1, title: 'Test Relation', isLatest: true }],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
        limit: 1,
      });

      mocks.rootListSpy.mockResolvedValue({
        data: [{ id: 1, name: 'Root 1' }],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
        limit: 1,
      });

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT - Should succeed because $nnull filter was automatically injected
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
    });

    it('should work fine with one-cardinality relations (no distinctFilter needed)', async () => {
      // ARRANGE - Using createOneToOneForwardRelation for proper typing
      const relation = createOneToOneForwardRelation('profile', 'TestRelation');
      const req = await mocks.createTestQuery(
        {
          sort: ['profile.title,ASC'], // No distinctFilter needed for one-to-one
        },
        [relation],
      );

      // Mock data
      mocks.relationListSpy.mockResolvedValue({
        data: [{ id: 1, rootId: 1, title: 'Developer Profile' }],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
        limit: 1,
      });

      mocks.rootListSpy.mockResolvedValue({
        data: [{ id: 1, name: 'Root 1' }],
        count: 1,
        total: 1,
        page: 1,
        pageCount: 1,
        limit: 1,
      });

      // ACT
      const result = await mocks.service.list(req);

      // ASSERT
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
    });
  });
});

import { WhereOperator } from '@concepta/nestjs-common';

import { CrudFederationException } from '../../../infrastructure/exceptions/crud-federation.exception';
import {
  assertHandlerCallCounts,
  assertRelationSortValidationError,
} from '../fixtures/crud-federation-test-assertions';
import { createOneToManyForwardRelation } from '../fixtures/crud-federation-test-entities';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../fixtures/crud-federation-test-setup';

/**
 * Validation tests for relation sort requirements (Scenario 14)
 * Relation sort requires specific $nnull filter on join key to ensure INNER JOIN semantics
 * Tests various invalid configurations and validates helpful error messages
 */
describe('CrudFederationService - Behavior: Relation Sort Validation', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  describe('Forward relationship validation', () => {
    it('should throw error when relation sort lacks any filters', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery(
        {
          sort: ['relations.title,ASC'], // No filters - will error!
        },
        [relation],
      );

      // ACT & ASSERT
      const error = await mocks.service.list(req).catch((e) => e);

      assertRelationSortValidationError(error);

      // No handlers should be called when validation fails
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 0 },
        { handler: mocks.relationListSpy, count: 0 },
      ]);
    });

    it('should throw error when relation sort has unrelated relation filters only', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery(
        {
          filter: ['relations.status||$eq||active'], // Unrelated filter, missing $nnull
          sort: ['relations.priority,DESC'],
        },
        [relation],
      );

      // ACT & ASSERT
      const error = await mocks.service.list(req).catch((e) => e);

      assertRelationSortValidationError(error);

      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 0 },
        { handler: mocks.relationListSpy, count: 0 },
      ]);
    });

    it('should throw error when relation sort has non-notnull filter', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery(
        {
          // This should trigger the validation error since no $nnull filter exists
          filter: ['relations.status||$eq||active'],
          sort: ['relations.title,ASC'],
        },
        [relation],
      );

      // ACT & ASSERT
      const error = await mocks.service.list(req).catch((e) => e);

      expect(error).toBeInstanceOf(CrudFederationException);
      expect(error.message).toContain('distinctFilter configuration');

      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 0 },
        { handler: mocks.relationListSpy, count: 0 },
      ]);
    });

    it('should throw error when relation sort has AND filter on non-join field only', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery(
        {
          filter: [
            'relations.status||$eq||active',
            'relations.priority||$gte||5',
          ], // No join key filter
          sort: ['relations.createdAt,DESC'],
        },
        [relation],
      );

      // ACT & ASSERT
      const error = await mocks.service.list(req).catch((e) => e);

      assertRelationSortValidationError(error);

      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 0 },
        { handler: mocks.relationListSpy, count: 0 },
      ]);
    });

    it('should provide helpful error message with join key filter suggestion', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery(
        {
          sort: ['relations.priority,DESC'],
        },
        [relation],
      );

      // ACT & ASSERT
      const error = await mocks.service.list(req).catch((e) => e);

      expect(error).toBeInstanceOf(CrudFederationException);
      expect(error.message).toContain('distinctFilter configuration');
      // The error message now suggests using distinctFilter configuration
    });
  });

  describe('Mixed filter scenarios', () => {
    it('should throw error when root filters exist but no relation join key filter', async () => {
      // ARRANGE
      const relation = createOneToManyForwardRelation(
        'relations',
        'TestRelation',
      );
      const req = await mocks.createTestQuery(
        {
          filter: ['name||$contains||Project'], // Root filter only
          sort: ['relations.title,ASC'], // Relation sort
        },
        [relation],
      );

      // ACT & ASSERT
      const error = await mocks.service.list(req).catch((e) => e);

      assertRelationSortValidationError(error);
    });
  });

  describe('Valid configurations (should not throw)', () => {
    it('should not throw error when valid $nnull filter exists', async () => {
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
        }, // distinctFilter configuration
      );
      const req = await mocks.createTestQuery(
        {
          filter: ['relations.rootId||$nnull'], // Valid filter
          sort: ['relations.title,ASC'],
        },
        [relation],
      );

      // Mock empty responses to avoid actual fetch logic
      mocks.relationListSpy.mockResolvedValue({
        data: [],
        count: 0,
        total: 0,
        page: 1,
        pageCount: 0,
        limit: 100,
      });

      // ACT - Should not throw
      const result = await mocks.service.list(req);

      // ASSERT - Validation passed, relation handler called
      expect(result.data).toEqual([]);
      assertHandlerCallCounts([
        { handler: mocks.rootListSpy, count: 0 }, // No roots when no relations
        { handler: mocks.relationListSpy, count: 1 },
      ]);
    });

    it('should not throw error when valid $nnull filter exists with additional filters', async () => {
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
        }, // distinctFilter configuration
      );
      const req = await mocks.createTestQuery(
        {
          filter: [
            'relations.rootId||$nnull', // Valid join key filter
            'relations.status||$eq||active', // Additional filter OK
          ],
          sort: ['relations.priority,DESC'],
        },
        [relation],
      );

      // Mock empty responses
      mocks.relationListSpy.mockResolvedValue({
        data: [],
        count: 0,
        total: 0,
        page: 1,
        pageCount: 0,
        limit: 100,
      });

      // ACT - Should not throw
      const result = await mocks.service.list(req);

      // ASSERT - Validation passed
      expect(result.data).toEqual([]);
      assertHandlerCallCounts([{ handler: mocks.relationListSpy, count: 1 }]);
    });
  });
});

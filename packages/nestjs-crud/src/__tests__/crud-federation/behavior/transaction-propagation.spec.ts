import {
  TransactionManagerInterface,
  WhereOperator,
} from '@concepta/nestjs-common';

import { createPaginatedResponse } from '../../../__fixtures__/crud/mocks/crud-paginated-response.mock';
import { createOneToManyForwardRelation } from '../fixtures/crud-federation-test-entities';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../fixtures/crud-federation-test-setup';

/**
 * Bug: createRelationContext hardcodes `trx: null`, so when the parent
 * context has an active transaction, relation queries execute outside
 * that transaction.
 *
 * Both ROOT_FIRST (enrichment) and RELATION_FIRST (constraint discovery)
 * paths are affected since both go through createRelationContext.
 */
describe('CrudFederationService - Transaction Propagation', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  it('should propagate trx to relation queries in ROOT_FIRST strategy', async () => {
    // ARRANGE - Simple ROOT_FIRST with one relation and a transaction
    const commentRelation = createOneToManyForwardRelation(
      'comments',
      'TestRelation',
    );

    const req = await mocks.createTestQuery({ limit: '10' }, [commentRelation]);

    // Inject a mock transaction into the context
    const mockTrx = {
      id: 'test-transaction',
    } as unknown as TransactionManagerInterface;
    req.trx = mockTrx;

    // Mock root service
    mocks.rootListSpy.mockResolvedValue(
      createPaginatedResponse(
        [
          { id: 1, name: 'Root 1' },
          { id: 2, name: 'Root 2' },
        ],
        { total: 2 },
      ),
    );

    // Mock relation service (enrichment)
    mocks.relationListSpy.mockResolvedValue(
      createPaginatedResponse(
        [
          { id: 101, rootId: 1, title: 'Comment 1' },
          { id: 102, rootId: 2, title: 'Comment 2' },
        ],
        { total: 2 },
      ),
    );

    // ACT
    await mocks.service.list(req);

    // ASSERT - Relation query should receive the transaction
    expect(mocks.relationListSpy).toHaveBeenCalled();
    const relationContext = mocks.relationListSpy.mock.calls[0][0];
    expect(relationContext.trx).toBe(mockTrx);
  });

  it('should propagate trx to relation queries in RELATION_FIRST strategy', async () => {
    // ARRANGE - Relation filter triggers RELATION_FIRST
    const commentRelation = createOneToManyForwardRelation(
      'comments',
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
        filter: ['comments.status||$eq||published'],
        limit: '5',
      },
      [commentRelation],
    );

    // Inject a mock transaction
    const mockTrx = {
      id: 'test-transaction-rf',
    } as unknown as TransactionManagerInterface;
    req.trx = mockTrx;

    // Mock relation constraint discovery
    mocks.relationListSpy
      .mockResolvedValueOnce(
        createPaginatedResponse(
          [
            {
              id: 101,
              rootId: 1,
              title: 'Comment 1',
              status: 'published',
              isLatest: true,
            },
            {
              id: 102,
              rootId: 2,
              title: 'Comment 2',
              status: 'published',
              isLatest: true,
            },
          ],
          { total: 2 },
        ),
      )
      // Enrichment call
      .mockResolvedValueOnce(
        createPaginatedResponse(
          [
            {
              id: 101,
              rootId: 1,
              title: 'Comment 1',
              status: 'published',
              isLatest: true,
            },
            {
              id: 102,
              rootId: 2,
              title: 'Comment 2',
              status: 'published',
              isLatest: true,
            },
          ],
          { total: 2 },
        ),
      );

    // Mock root service
    mocks.rootListSpy.mockResolvedValue(
      createPaginatedResponse(
        [
          { id: 1, name: 'Root 1' },
          { id: 2, name: 'Root 2' },
        ],
        { total: 2 },
      ),
    );

    // ACT
    await mocks.service.list(req);

    // ASSERT - All relation calls should have the transaction
    expect(mocks.relationListSpy).toHaveBeenCalled();
    for (const call of mocks.relationListSpy.mock.calls) {
      expect(call[0].trx).toBe(mockTrx);
    }
  });
});

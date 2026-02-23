import { WhereOperator } from '@concepta/nestjs-common';

import { createPaginatedResponse } from '../fixtures/crud-federation-mock-helpers';
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
 * Bug: processRelationsSequentially uses `rootKey` (e.g., 'id') when
 * constraining subsequent relations, but should use
 * `relationBinding.foreignKey` (e.g., 'rootId').
 *
 * Owner (inverse) relations are filtered out of sequential processing
 * on line 2042-2044, so this only affects forward relations.
 *
 * The constraint values ARE root PK values (extracted via foreignKey
 * from the previous relation's data), so the filter field on the next
 * relation must be that relation's foreignKey — not the root's PK name.
 */
describe('CrudFederationService - Multi-Relation Constraint Field', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  it('should use foreignKey (not rootKey) when constraining second relation', async () => {
    // ARRANGE - Two forward relations: profiles (driving) + comments (constrained)
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
        primaryKey: 'id',
        foreignKey: 'rootId',
        distinctFilter: {
          field: 'isLatest',
          operator: WhereOperator.EQ,
          value: true,
        },
      },
    );

    // Profile filter triggers RELATION_FIRST
    const req = await mocks.createTestQuery(
      {
        filter: [
          'profiles.isActive||$eq||true',
          'comments.status||$eq||published',
        ],
        limit: '5',
      },
      [profileRelation, commentRelation],
    );

    // Profile discovery returns root IDs [10, 20, 30]
    mocks.profileListSpy
      .mockResolvedValueOnce(
        createPaginatedResponse(
          [
            { id: 1, rootId: 10, bio: 'A', isActive: true },
            { id: 2, rootId: 20, bio: 'B', isActive: true },
            { id: 3, rootId: 30, bio: 'C', isActive: true },
          ],
          { total: 3 },
        ),
      )
      .mockResolvedValueOnce(
        createPaginatedResponse(
          [
            { id: 1, rootId: 10, bio: 'A', isActive: true },
            { id: 2, rootId: 20, bio: 'B', isActive: true },
          ],
          { total: 2 },
        ),
      );

    // Comment constrained query + enrichment
    mocks.relationListSpy
      .mockResolvedValueOnce(
        createPaginatedResponse(
          [
            {
              id: 101,
              rootId: 10,
              title: 'Comment A',
              status: 'published',
              isLatest: true,
            },
            {
              id: 102,
              rootId: 20,
              title: 'Comment B',
              status: 'published',
              isLatest: true,
            },
          ],
          { total: 2 },
        ),
      )
      .mockResolvedValueOnce(
        createPaginatedResponse(
          [
            {
              id: 101,
              rootId: 10,
              title: 'Comment A',
              status: 'published',
              isLatest: true,
            },
            {
              id: 102,
              rootId: 20,
              title: 'Comment B',
              status: 'published',
              isLatest: true,
            },
          ],
          { total: 2 },
        ),
      );

    mocks.rootListSpy.mockResolvedValue(
      createPaginatedResponse(
        [
          { id: 10, name: 'Root 10' },
          { id: 20, name: 'Root 20' },
        ],
        { total: 2 },
      ),
    );

    // ACT
    await mocks.service.list(req);

    // ASSERT - The comment relation's constraint filter must use
    // foreignKey ('rootId'), not rootKey ('id').
    // Direct filter assertion since assertRelationQuery ignores filter by default.
    const commentContext = mocks.relationListSpy.mock.calls[0][0];
    const constraintFilter = commentContext.query.filter.find(
      (f: { operator: string }) => f.operator === 'in',
    );
    expect(constraintFilter).toBeDefined();
    expect(constraintFilter.field).toBe('rootId');
    expect(constraintFilter.value).toEqual([10, 20, 30]);
  });
});

import { mock } from 'jest-mock-extended';

import { CrudResolverInterface } from '../../infrastructure/resolvers/interfaces/crud-resolver.interface';
import { CrudFederationService } from '../../infrastructure/services/crud-federation.service';

import {
  TestRoot,
  TestRelation,
  createOneToManyForwardRelation,
  createTestContext,
  createTestRelations,
} from './fixtures/crud-federation-test-entities';

describe('CrudFederationService - Handler Resolution', () => {
  it('should resolve root and relation queries to their registered handlers', async () => {
    // Create mock resolver with spies for each entity type
    const mockResolver = mock<CrudResolverInterface>();

    // Create spies for list operations
    const rootListSpy = jest.fn();
    const relationListSpy = jest.fn();

    // Set up mock responses
    rootListSpy.mockResolvedValue({
      data: [
        { id: 1, name: 'Root 1' },
        { id: 2, name: 'Root 2' },
      ],
      count: 2,
      total: 2,
      page: 1,
      pageCount: 1,
      limit: 10,
    });
    relationListSpy.mockResolvedValue({
      data: [
        { id: 1, rootId: 1, title: 'Relation 1' },
        { id: 2, rootId: 2, title: 'Relation 2' },
      ],
      count: 2,
      total: 2,
      page: 1,
      pageCount: 1,
      limit: 10,
    });

    // Route resolver calls based on context.entity
    mockResolver.list.mockImplementation((context) => {
      switch (context.entity) {
        case 'TestRoot':
          return rootListSpy(context);
        case 'TestRelation':
          return relationListSpy(context);
        default:
          throw new Error(`Unknown entity: ${context.entity}`);
      }
    });

    // Create federation service with mock resolver
    const federationService = new CrudFederationService<
      TestRoot,
      TestRelation[]
    >(mockResolver, 'TestRoot');

    // Create request with relation
    const relation = createOneToManyForwardRelation<TestRelation>(
      'relations',
      'TestRelation',
    );

    const request = createTestContext<TestRoot>();
    Object.assign(request.options, {
      query: {
        relations: createTestRelations([relation]),
      },
    });

    // Execute federation list
    await federationService.list(request);

    // Verify both handlers were called via resolver
    expect(rootListSpy).toHaveBeenCalled();
    expect(relationListSpy).toHaveBeenCalled();

    // Verify root handler received correct query structure
    const rootCall = rootListSpy.mock.calls[0][0];
    expect(rootCall.entity).toBe('TestRoot');

    // Verify relation handler received correct query structure
    const relationCall = relationListSpy.mock.calls[0][0];
    expect(relationCall.entity).toBe('TestRelation');
  });

  it('should correctly identify handler for specific entity types', async () => {
    const mockResolver = mock<CrudResolverInterface>();

    const rootListSpy = jest.fn();
    const relationListSpy = jest.fn();

    rootListSpy.mockResolvedValue({
      data: [{ id: 1, name: 'Root 1' }],
      count: 1,
      total: 1,
    });
    relationListSpy.mockResolvedValue({
      data: [
        { id: 1, rootId: 1, title: 'Relation 1' },
        { id: 2, rootId: 1, title: 'Relation 2' },
      ],
      count: 2,
      total: 2,
    });

    mockResolver.list.mockImplementation((context) => {
      switch (context.entity) {
        case 'TestRoot':
          return rootListSpy(context);
        case 'TestRelation':
          return relationListSpy(context);
        default:
          throw new Error(`Unknown entity: ${context.entity}`);
      }
    });

    const federationService = new CrudFederationService<
      TestRoot,
      TestRelation[]
    >(mockResolver, 'TestRoot');

    const relation = createOneToManyForwardRelation<TestRelation>(
      'relations',
      'TestRelation',
    );

    const request = createTestContext<TestRoot>();
    Object.assign(request.options, {
      query: {
        relations: createTestRelations([relation]),
      },
    });

    const result = await federationService.list(request);

    // Verify data was returned
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe(1);

    // Verify relations were hydrated
    expect(result.data[0].relations).toBeDefined();
    expect(result.data[0].relations).toHaveLength(2);
  });
});

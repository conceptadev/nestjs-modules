import { mockCrudContext } from '../../../../__fixtures__/crud/mocks/crud-context.mock';
import { createMockFederationService } from '../../../../__fixtures__/crud/mocks/crud-federation-service.mock';
import { CrudQueryException } from '../../../../infrastructure/exceptions/crud-query.exception';
import { CrudQueryHandler } from '../crud-query.handler';

import {
  TestCrudAdapter,
  TestEntity,
  createTestAdapter,
  relationsWithPosts,
} from './fixtures/query-handler-test.fixtures';

describe('CrudQueryHandler', () => {
  let adapter: TestCrudAdapter;

  beforeAll(() => {
    adapter = createTestAdapter();
  });

  describe('execute', () => {
    it('should throw CrudQueryException from base implementation', () => {
      const handler = new CrudQueryHandler(adapter);
      expect(() => handler.execute({} as never)).toThrow(CrudQueryException);
    });
  });

  describe('hasRelations', () => {
    it('should return false when no options', () => {
      const handler = new CrudQueryHandler(adapter);
      expect(handler.hasRelations(mockCrudContext())).toBe(false);
    });

    it('should return false when relations array is empty', () => {
      const handler = new CrudQueryHandler(adapter);
      const ctx = mockCrudContext({
        options: {
          query: {
            relations: { rootKey: 'id', relations: [] as never },
          },
        },
      });
      expect(handler.hasRelations(ctx)).toBe(false);
    });

    it('should return true when relations are configured', () => {
      const handler = new CrudQueryHandler(adapter);
      const ctx = mockCrudContext({
        options: { query: { relations: relationsWithPosts } },
      });
      expect(handler.hasRelations(ctx)).toBe(true);
    });
  });

  describe('useFederation', () => {
    it('should return false when no federation service', () => {
      const handler = new CrudQueryHandler(adapter);
      const ctx = mockCrudContext({
        options: {
          query: {
            relations: { ...relationsWithPosts, federated: true },
          },
        },
      });
      expect(handler.useFederation(ctx)).toBe(false);
    });

    it('should return true when federation service + federated + relations', () => {
      const mockFederationService = createMockFederationService<TestEntity>();
      const handler = new CrudQueryHandler(adapter, mockFederationService);
      const ctx = mockCrudContext({
        options: {
          query: {
            relations: { ...relationsWithPosts, federated: true },
          },
        },
      });
      expect(handler.useFederation(ctx)).toBe(true);
    });

    it('should return false when federated is false', () => {
      const mockFederationService = createMockFederationService<TestEntity>();
      const handler = new CrudQueryHandler(adapter, mockFederationService);
      const ctx = mockCrudContext({
        options: {
          query: {
            relations: { ...relationsWithPosts, federated: false },
          },
        },
      });
      expect(handler.useFederation(ctx)).toBe(false);
    });

    it('should return false when federated is true but no relations', () => {
      const mockFederationService = createMockFederationService<TestEntity>();
      const handler = new CrudQueryHandler(adapter, mockFederationService);
      const ctx = mockCrudContext({
        options: {
          query: {
            relations: {
              rootKey: 'id',
              federated: true,
              relations: [] as never,
            },
          },
        },
      });
      expect(handler.useFederation(ctx)).toBe(false);
    });

    it('should return false when no relations config at all', () => {
      const mockFederationService = createMockFederationService<TestEntity>();
      const handler = new CrudQueryHandler(adapter, mockFederationService);
      expect(handler.useFederation(mockCrudContext())).toBe(false);
    });
  });
});

import { BadRequestException } from '@nestjs/common';

import { mockCrudContext } from '../../../../__fixtures__/crud/mocks/crud-context.mock';
import { createMockFederationService } from '../../../../__fixtures__/crud/mocks/crud-federation-service.mock';
import { CrudQueryException } from '../../../../infrastructure/exceptions/crud-query.exception';
import { CrudReadQuery } from '../../impl/crud-read.query';
import { CrudReadHandler } from '../crud-read.handler';

import {
  TestCrudAdapter,
  TestEntity,
  createTestAdapter,
  relationsWithPosts,
} from './fixtures/query-handler-test.fixtures';

describe('CrudReadHandler', () => {
  let adapter: TestCrudAdapter;

  beforeAll(() => {
    adapter = createTestAdapter();
  });

  describe('execute', () => {
    it('should delegate to crudAdapter.read() when no federation', async () => {
      const handler = new CrudReadHandler<TestEntity>(adapter);
      const context = mockCrudContext<TestEntity>();
      const entity: TestEntity = { id: '1', name: 'Alice' };

      jest.spyOn(adapter, 'read').mockResolvedValueOnce(entity);

      const result = await handler.execute(new CrudReadQuery(context));

      expect(result).toEqual(entity);
      expect(adapter.read).toHaveBeenCalledWith(context);
    });

    it('should delegate to federationService.read() when federation is configured', async () => {
      const federationService = createMockFederationService<TestEntity>();
      const handler = new CrudReadHandler(adapter, federationService);
      const context = mockCrudContext<TestEntity>({
        options: {
          query: {
            relations: { ...relationsWithPosts, federated: true },
          },
        },
      });
      const entity: TestEntity = { id: '2', name: 'Bob' };

      federationService.read.mockResolvedValueOnce(entity);

      const result = await handler.execute(new CrudReadQuery(context));

      expect(result).toEqual(entity);
      expect(federationService.read).toHaveBeenCalledWith(context);
    });

    it('should re-throw HttpException as-is', async () => {
      const handler = new CrudReadHandler<TestEntity>(adapter);
      const context = mockCrudContext<TestEntity>();
      const httpError = new BadRequestException('Invalid request');

      jest.spyOn(adapter, 'read').mockRejectedValueOnce(httpError);

      await expect(handler.execute(new CrudReadQuery(context))).rejects.toThrow(
        httpError,
      );
    });

    it('should wrap non-Http errors in CrudQueryException', async () => {
      const handler = new CrudReadHandler<TestEntity>(adapter);
      const context = mockCrudContext<TestEntity>();

      jest
        .spyOn(adapter, 'read')
        .mockRejectedValueOnce(new Error('database timeout'));

      await expect(handler.execute(new CrudReadQuery(context))).rejects.toThrow(
        CrudQueryException,
      );
    });

    it('should include entity name in CrudQueryException', async () => {
      const handler = new CrudReadHandler<TestEntity>(adapter);
      const context = mockCrudContext<TestEntity>();

      jest
        .spyOn(adapter, 'read')
        .mockRejectedValueOnce(new Error('connection lost'));
      jest.spyOn(adapter, 'entityName').mockReturnValue('TestEntity');

      try {
        await handler.execute(new CrudReadQuery(context));
        fail('Expected CrudQueryException to be thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(CrudQueryException);
        expect((e as CrudQueryException).context.entityName).toEqual(
          'TestEntity',
        );
      }
    });
  });
});

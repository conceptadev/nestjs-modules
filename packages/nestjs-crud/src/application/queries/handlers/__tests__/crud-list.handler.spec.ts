import { BadRequestException } from '@nestjs/common';

import { mockCrudContext } from '../../../../__fixtures__/crud/mocks/crud-context.mock';
import { createPaginatedResponse } from '../../../../__fixtures__/crud/mocks/crud-paginated-response.mock';
import { CrudQueryException } from '../../../../infrastructure/exceptions/crud-query.exception';
import { CrudListQuery } from '../../impl/crud-list.query';
import { CrudListHandler } from '../crud-list.handler';

import {
  TestCrudAdapter,
  TestEntity,
  createTestAdapter,
} from './fixtures/query-handler-test.fixture';

describe('CrudListHandler', () => {
  let adapter: TestCrudAdapter;

  beforeAll(() => {
    adapter = createTestAdapter();
  });

  describe('execute', () => {
    it('should delegate to crudAdapter.list()', async () => {
      const handler = new CrudListHandler<TestEntity>(adapter);
      const context = mockCrudContext<TestEntity>();
      const paginatedResult = createPaginatedResponse<TestEntity>([
        { id: '1', name: 'Alice' },
      ]);

      jest.spyOn(adapter, 'list').mockResolvedValueOnce(paginatedResult);

      const result = await handler.execute(new CrudListQuery(context));

      expect(result).toEqual(paginatedResult);
      expect(adapter.list).toHaveBeenCalledWith(context);
    });

    it('should re-throw HttpException as-is', async () => {
      const handler = new CrudListHandler<TestEntity>(adapter);
      const context = mockCrudContext<TestEntity>();
      const httpError = new BadRequestException('Invalid query');

      jest.spyOn(adapter, 'list').mockRejectedValueOnce(httpError);

      await expect(handler.execute(new CrudListQuery(context))).rejects.toThrow(
        httpError,
      );
    });

    it('should wrap non-Http errors in CrudQueryException', async () => {
      const handler = new CrudListHandler<TestEntity>(adapter);
      const context = mockCrudContext<TestEntity>();

      jest
        .spyOn(adapter, 'list')
        .mockRejectedValueOnce(new Error('database timeout'));

      await expect(handler.execute(new CrudListQuery(context))).rejects.toThrow(
        CrudQueryException,
      );
    });

    it('should include entity name in CrudQueryException', async () => {
      const handler = new CrudListHandler<TestEntity>(adapter);
      const context = mockCrudContext<TestEntity>();

      jest
        .spyOn(adapter, 'list')
        .mockRejectedValueOnce(new Error('connection lost'));
      jest.spyOn(adapter, 'entityName').mockReturnValue('TestEntity');

      try {
        await handler.execute(new CrudListQuery(context));
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

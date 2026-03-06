import { BadRequestException } from '@nestjs/common';

import { mockCrudContext } from '../../../../__fixtures__/crud/mocks/crud-context.mock';
import { CrudQueryException } from '../../../../infrastructure/exceptions/crud-query.exception';
import { CrudReadQuery } from '../../impl/crud-read.query';
import { CrudReadHandler } from '../crud-read.handler';

import {
  TestCrudAdapter,
  TestEntity,
  createTestAdapter,
} from './fixtures/query-handler-test.fixture';

describe('CrudReadHandler', () => {
  let adapter: TestCrudAdapter;

  beforeAll(() => {
    adapter = createTestAdapter();
  });

  describe('execute', () => {
    it('should delegate to crudAdapter.read()', async () => {
      const handler = new CrudReadHandler<TestEntity>(adapter);
      const context = mockCrudContext<TestEntity>();
      const entity: TestEntity = { id: '1', name: 'Alice' };

      jest.spyOn(adapter, 'read').mockResolvedValueOnce(entity);

      const result = await handler.execute(new CrudReadQuery(context));

      expect(result).toEqual(entity);
      expect(adapter.read).toHaveBeenCalledWith(context);
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

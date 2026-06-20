import { CrudQueryException } from '../../../../infrastructure/exceptions/crud-query.exception';
import { CrudQueryHandler } from '../crud-query.handler';

import {
  TestCrudAdapter,
  createTestAdapter,
} from './fixtures/query-handler-test.fixture';

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
});

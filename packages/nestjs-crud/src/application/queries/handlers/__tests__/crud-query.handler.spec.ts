import { CrudQueryException } from '../../../../infrastructure/exceptions/crud-query.exception.js';
import { CrudQueryHandler } from '../crud-query.handler.js';

import {
  type TestCrudAdapter,
  createTestAdapter,
} from './fixtures/query-handler-test.fixture.js';

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

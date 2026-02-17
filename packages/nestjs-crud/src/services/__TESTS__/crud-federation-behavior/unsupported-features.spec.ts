import { CrudFederationException } from '../../../exceptions/crud-federation.exception';
import {
  setupCrudFederationTests,
  cleanupCrudFederationTests,
  CrudFederationTestMocks,
} from '../../__FIXTURES__/crud-federation-test-setup';

describe('CrudFederationService - Unsupported Features Validation', () => {
  let mocks: CrudFederationTestMocks;

  beforeEach(async () => {
    mocks = await setupCrudFederationTests();
  });

  afterEach(async () => {
    await cleanupCrudFederationTests(mocks);
  });

  describe('OR filter via query string validation', () => {
    it('should throw error when req.query.or has filters', async () => {
      // Pass OR filter through query string to test validation
      const req = await mocks.createTestQuery({
        or: ['name||$contains||test'],
      });

      await expect(mocks.service.list(req)).rejects.toThrow(
        'OR filter via query string is not supported in CRUD federation. ' +
          'Use AND filter conditions instead.',
      );

      expect(mocks.rootListSpy).not.toHaveBeenCalled();
    });

    it('should not throw error when req.query.or is empty array', async () => {
      // Empty query - no OR filters
      const req = await mocks.createTestQuery();

      // Should not throw CrudFederationException for empty or array
      try {
        await mocks.service.list(req);
      } catch (error) {
        expect(error).not.toBeInstanceOf(CrudFederationException);
      }
    });
  });
});

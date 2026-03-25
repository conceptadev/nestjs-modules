import {
  createMockCacheRepository,
  createMockRepositoryResolver,
  createMockTransaction,
  DEFAULT_CACHE_NAMESPACE,
} from '../../../../__tests__/helpers/mock.helpers';
import { ClearCachesByAssigneeCommand } from '../../impl/clear-caches-by-assignee.command';
import { ClearCachesByAssigneeHandler } from '../clear-caches-by-assignee.handler';

describe(ClearCachesByAssigneeHandler.name, () => {
  const ctx = {};
  let mockRepo: ReturnType<typeof createMockCacheRepository>;
  let handler: ClearCachesByAssigneeHandler;

  beforeEach(() => {
    mockRepo = createMockCacheRepository();
    const { transaction } = createMockTransaction();

    handler = new ClearCachesByAssigneeHandler(
      createMockRepositoryResolver(mockRepo),
      transaction as never,
    );
  });

  it('should call removeAllByAssignee with the assignee id', async () => {
    await handler.execute(
      new ClearCachesByAssigneeCommand(ctx, DEFAULT_CACHE_NAMESPACE, 'test-assignee'),
    );

    expect(mockRepo.removeAllByAssignee).toHaveBeenCalledWith(
      expect.anything(),
      'test-assignee',
    );
  });
});

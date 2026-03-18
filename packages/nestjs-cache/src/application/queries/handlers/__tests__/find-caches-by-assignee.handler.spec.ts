import {
  createMockCacheRepository,
  createMockRepositoryResolver,
  createMockContext,
  createMockCacheEntity,
  toCacheDomain,
} from '../../../../__tests__/helpers/mock.helpers';
import { FindCachesByAssigneeQuery } from '../../impl/find-caches-by-assignee.query';
import { FindCachesByAssigneeHandler } from '../find-caches-by-assignee.handler';

describe(FindCachesByAssigneeHandler.name, () => {
  const ctx = createMockContext();
  let mockRepo: ReturnType<typeof createMockCacheRepository>;
  let handler: FindCachesByAssigneeHandler;

  beforeEach(() => {
    mockRepo = createMockCacheRepository();
    handler = new FindCachesByAssigneeHandler(
      createMockRepositoryResolver(mockRepo),
    );
  });

  it('should return an array of caches', async () => {
    const entity = createMockCacheEntity();
    mockRepo.findAllByAssignee.mockResolvedValue([
      toCacheDomain(entity),
      toCacheDomain({ ...entity, id: 'id-2' }),
    ]);

    const result = await handler.execute(
      new FindCachesByAssigneeQuery(ctx, 'test-assignee'),
    );

    expect(result).toHaveLength(2);
  });

  it('should return empty array when no matches', async () => {
    mockRepo.findAllByAssignee.mockResolvedValue([]);

    const result = await handler.execute(
      new FindCachesByAssigneeQuery(ctx, 'no-match'),
    );

    expect(result).toEqual([]);
  });
});

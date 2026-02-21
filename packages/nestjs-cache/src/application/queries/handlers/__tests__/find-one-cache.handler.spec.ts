import {
  createMockCacheRepository,
  createMockRepositoryResolver,
  createMockContext,
  createMockCacheEntity,
} from '../../../../__tests__/helpers/mock.helpers';
import { Cache } from '../../../../domain/aggregates/cache';
import { FindOneCacheQuery } from '../../impl/find-one-cache.query';
import { FindOneCacheHandler } from '../find-one-cache.handler';

describe(FindOneCacheHandler.name, () => {
  const ctx = createMockContext();
  let mockRepo: ReturnType<typeof createMockCacheRepository>;
  let handler: FindOneCacheHandler;

  beforeEach(() => {
    mockRepo = createMockCacheRepository();
    handler = new FindOneCacheHandler(createMockRepositoryResolver(mockRepo));
  });

  it('should return a Cache when found', async () => {
    mockRepo.findOne.mockResolvedValue(
      Cache.toInstance(createMockCacheEntity()),
    );

    const result = await handler.execute(
      new FindOneCacheQuery(ctx, 'key', 'type', 'assignee'),
    );

    expect(result).not.toBeNull();
    expect(result!.id).toBe('test-id');
  });

  it('should return null when not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    const result = await handler.execute(
      new FindOneCacheQuery(ctx, 'key', 'type', 'assignee'),
    );

    expect(result).toBeNull();
  });
});

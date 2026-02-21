import {
  createMockCacheRepository,
  createMockRepositoryResolver,
  createMockContext,
  createMockCacheEntity,
} from '../../../../__tests__/helpers/mock.helpers';
import { Cache } from '../../../../domain/aggregates/cache';
import { GetCacheQuery } from '../../impl/get-cache.query';
import { GetCacheHandler } from '../get-cache.handler';

describe(GetCacheHandler.name, () => {
  const ctx = createMockContext();
  let mockRepo: ReturnType<typeof createMockCacheRepository>;
  let handler: GetCacheHandler;

  beforeEach(() => {
    mockRepo = createMockCacheRepository();
    handler = new GetCacheHandler(createMockRepositoryResolver(mockRepo));
  });

  it('should return a Cache for a valid id', async () => {
    const entity = createMockCacheEntity();
    mockRepo.get.mockResolvedValue(Cache.toInstance(entity));

    const result = await handler.execute(new GetCacheQuery(ctx, 'test-id'));

    expect(result).toBeInstanceOf(Cache);
    expect(result.id).toBe('test-id');
  });
});

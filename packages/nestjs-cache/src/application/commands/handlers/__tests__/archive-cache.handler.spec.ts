import {
  createMockCacheRepository,
  createMockRepositoryResolver,
  createMockTransaction,
  createMockCacheEntity,
  toCacheDomain,
  DEFAULT_CACHE_NAMESPACE,
} from '../../../../__tests__/helpers/mock.helpers';
import { Cache } from '../../../../domain/aggregates/cache';
import { ArchiveCacheCommand } from '../../impl/archive-cache.command';
import { ArchiveCacheHandler } from '../archive-cache.handler';

describe(ArchiveCacheHandler.name, () => {
  const ctx = {};
  let mockRepo: ReturnType<typeof createMockCacheRepository>;
  let handler: ArchiveCacheHandler;

  beforeEach(() => {
    mockRepo = createMockCacheRepository();
    const { transaction } = createMockTransaction();

    handler = new ArchiveCacheHandler(
      createMockRepositoryResolver(mockRepo),
      transaction as never,
    );
  });

  it('should return the archived Cache', async () => {
    mockRepo.get.mockResolvedValue(toCacheDomain(createMockCacheEntity()));

    const result = await handler.execute(
      new ArchiveCacheCommand(ctx, DEFAULT_CACHE_NAMESPACE, 'test-id'),
    );

    expect(result).toBeInstanceOf(Cache);
    expect(result.id).toBe('test-id');
  });

  it('should call softRemove on the repository', async () => {
    mockRepo.get.mockResolvedValue(toCacheDomain(createMockCacheEntity()));

    await handler.execute(new ArchiveCacheCommand(ctx, DEFAULT_CACHE_NAMESPACE, 'test-id'));

    expect(mockRepo.softRemove).toHaveBeenCalledTimes(1);
  });
});

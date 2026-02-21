import {
  createMockCacheRepository,
  createMockRepositoryResolver,
  createMockTransaction,
  createMockContext,
  createMockCacheEntity,
} from '../../../../__tests__/helpers/mock.helpers';
import { Cache } from '../../../../domain/aggregates/cache';
import { ArchiveCacheCommand } from '../../impl/archive-cache.command';
import { ArchiveCacheHandler } from '../archive-cache.handler';

describe(ArchiveCacheHandler.name, () => {
  const ctx = createMockContext();
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
    mockRepo.get.mockResolvedValue(Cache.toInstance(createMockCacheEntity()));

    const result = await handler.execute(
      new ArchiveCacheCommand(ctx, 'test-id'),
    );

    expect(result).toBeInstanceOf(Cache);
    expect(result.id).toBe('test-id');
  });

  it('should call softRemove on the repository', async () => {
    mockRepo.get.mockResolvedValue(Cache.toInstance(createMockCacheEntity()));

    await handler.execute(new ArchiveCacheCommand(ctx, 'test-id'));

    expect(mockRepo.softRemove).toHaveBeenCalledTimes(1);
  });
});

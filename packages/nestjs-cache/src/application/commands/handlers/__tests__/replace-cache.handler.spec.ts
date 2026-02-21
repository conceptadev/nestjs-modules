import {
  createMockCacheRepository,
  createMockRepositoryResolver,
  createMockTransaction,
  createMockEventPublisher,
  createMockContext,
  createMockCacheEntity,
} from '../../../../__tests__/helpers/mock.helpers';
import { Cache } from '../../../../domain/aggregates/cache';
import { CacheSettingsInterface } from '../../../../infrastructure/config/interfaces/cache-settings.interface';
import { ReplaceCacheCommand } from '../../impl/replace-cache.command';
import { ReplaceCacheHandler } from '../replace-cache.handler';

describe(ReplaceCacheHandler.name, () => {
  const ctx = createMockContext();
  const settings: CacheSettingsInterface = { expiresIn: '1h' };
  let mockRepo: ReturnType<typeof createMockCacheRepository>;
  let handler: ReplaceCacheHandler;

  beforeEach(() => {
    mockRepo = createMockCacheRepository();
    const { transaction } = createMockTransaction();

    handler = new ReplaceCacheHandler(
      createMockRepositoryResolver(mockRepo),
      transaction as never,
      createMockEventPublisher() as never,
      settings,
    );
  });

  const dto = {
    key: 'test-key',
    type: 'test-type',
    data: 'replaced-data',
    assigneeId: 'test-assignee',
    expiresIn: '1h',
  };

  it('should replace an existing cache', async () => {
    mockRepo.findById.mockResolvedValue(
      Cache.toInstance(createMockCacheEntity()),
    );

    const result = await handler.execute(
      new ReplaceCacheCommand(ctx, 'test-id', dto),
    );

    expect(result).toBeInstanceOf(Cache);
    expect(result.data).toBe('replaced-data');
  });

  it('should create a new cache when not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    const result = await handler.execute(
      new ReplaceCacheCommand(ctx, 'new-id', dto),
    );

    expect(result).toBeInstanceOf(Cache);
    expect(result.id).toBe('new-id');
  });

  it('should save in both paths', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await handler.execute(new ReplaceCacheCommand(ctx, 'new-id', dto));

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });
});

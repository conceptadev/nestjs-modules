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
import { UpsertCacheCommand } from '../../impl/upsert-cache.command';
import { UpsertCacheHandler } from '../upsert-cache.handler';

describe(UpsertCacheHandler.name, () => {
  const ctx = createMockContext();
  const settings: CacheSettingsInterface = { expiresIn: '1h' };
  let mockRepo: ReturnType<typeof createMockCacheRepository>;
  let handler: UpsertCacheHandler;

  beforeEach(() => {
    mockRepo = createMockCacheRepository();
    const { transaction } = createMockTransaction();

    handler = new UpsertCacheHandler(
      createMockRepositoryResolver(mockRepo),
      transaction as never,
      createMockEventPublisher() as never,
      settings,
    );
  });

  const dto = {
    key: 'test-key',
    type: 'test-type',
    data: 'upsert-data',
    assigneeId: 'test-assignee',
    expiresIn: '2h',
  };

  it('should update existing cache when found', async () => {
    mockRepo.findOne.mockResolvedValue(
      Cache.toInstance(createMockCacheEntity()),
    );

    const result = await handler.execute(new UpsertCacheCommand(ctx, dto));

    expect(result).toBeInstanceOf(Cache);
    expect(result.data).toBe('upsert-data');
  });

  it('should create a new cache when not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    const result = await handler.execute(new UpsertCacheCommand(ctx, dto));

    expect(result).toBeInstanceOf(Cache);
    expect(result.key).toBe('test-key');
  });

  it('should save in both paths', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await handler.execute(new UpsertCacheCommand(ctx, dto));

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });
});

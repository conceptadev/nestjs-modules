import {
  createMockCacheRepository,
  createMockRepositoryResolver,
  createMockTransaction,
  createMockEventPublisher,
  DEFAULT_CACHE_NAMESPACE,
} from '../../../../__tests__/helpers/mock.helpers';
import { Cache } from '../../../../domain/aggregates/cache';
import { CacheExpirationPolicy } from '../../../../domain/policies/cache-expiration.policy';
import { CreateCacheCommand } from '../../impl/create-cache.command';
import { CreateCacheHandler } from '../create-cache.handler';

describe(CreateCacheHandler.name, () => {
  const ctx = {};
  const policy = new CacheExpirationPolicy({ expiresIn: '1h' });
  let mockRepo: ReturnType<typeof createMockCacheRepository>;
  let handler: CreateCacheHandler;
  let trxHandle: ReturnType<typeof createMockTransaction>['trxHandle'];

  beforeEach(() => {
    mockRepo = createMockCacheRepository();
    const { transaction, trxHandle: trx } = createMockTransaction();
    trxHandle = trx;

    handler = new CreateCacheHandler(
      createMockRepositoryResolver(mockRepo),
      transaction as never,
      createMockEventPublisher() as never,
      policy,
    );
  });

  it('should return a Cache instance', async () => {
    const dto = {
      key: 'test-key',
      type: 'test-type',
      data: 'test-data',
      assigneeId: 'test-assignee',
      expiresIn: '1h',
    };

    const result = await handler.execute(new CreateCacheCommand(ctx, DEFAULT_CACHE_NAMESPACE, dto));

    expect(result).toBeInstanceOf(Cache);
    expect(result.key).toBe('test-key');
  });

  it('should persist the cache via save', async () => {
    const dto = {
      key: 'k',
      type: 't',
      data: 'd',
      assigneeId: 'a',
      expiresIn: '1h',
    };

    await handler.execute(new CreateCacheCommand(ctx, DEFAULT_CACHE_NAMESPACE, dto));

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });

  it('should register onCommit and onRollback', async () => {
    const dto = {
      key: 'k',
      type: 't',
      data: 'd',
      assigneeId: 'a',
      expiresIn: null,
    };

    await handler.execute(new CreateCacheCommand(ctx, DEFAULT_CACHE_NAMESPACE, dto));

    expect(trxHandle.onCommit).toHaveBeenCalledTimes(1);
    expect(trxHandle.onRollback).toHaveBeenCalledTimes(1);
  });
});

import {
  CacheCreatableInterface,
  CacheInterface,
} from '@concepta/nestjs-common';
import { CrudReplaceCommand } from '@concepta/nestjs-crud';

import {
  createMockCommandBus,
  createMockCacheEntity,
} from '../../../../../__tests__/helpers/mock.helpers';
import { Cache } from '../../../../../domain/aggregates/cache';
import { ReplaceCacheRequestHandler } from '../replace-cache-request.handler';

describe(ReplaceCacheRequestHandler.name, () => {
  let commandBus: ReturnType<typeof createMockCommandBus>;
  let handler: ReplaceCacheRequestHandler;

  beforeEach(() => {
    commandBus = createMockCommandBus();
    handler = new ReplaceCacheRequestHandler(commandBus as never);
  });

  it('should return a plain cache object', async () => {
    commandBus.execute.mockResolvedValue(
      Cache.toInstance(createMockCacheEntity({ data: 'replaced-data' })),
    );

    const context = {
      entity: 'UserCache',
      params: { id: 'test-id' },
    } as never;
    const dto: CacheCreatableInterface = {
      key: 'test-key',
      type: 'test-type',
      data: 'replaced-data',
      assigneeId: 'test-assignee',
      expiresIn: '1h',
    };

    const result = await handler.execute(
      new CrudReplaceCommand<CacheInterface, CacheCreatableInterface>(
        context,
        dto,
      ),
    );

    expect(result).not.toBeInstanceOf(Cache);
    expect(result.data).toBe('replaced-data');
  });

  it('should throw when id is not a string', async () => {
    const context = {
      entity: 'UserCache',
      params: { id: undefined },
    } as never;
    const dto: CacheCreatableInterface = {
      key: 'k',
      type: 't',
      data: 'd',
      assigneeId: 'a',
      expiresIn: null,
    };

    await expect(
      handler.execute(
        new CrudReplaceCommand<CacheInterface, CacheCreatableInterface>(
          context,
          dto,
        ),
      ),
    ).rejects.toThrow();
  });
});

import {
  CacheInterface,
  CacheUpdatableInterface,
} from '@concepta/nestjs-common';
import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import {
  createMockCommandBus,
  createMockCacheEntity,
} from '../../../../../__tests__/helpers/mock.helpers';
import { Cache } from '../../../../../domain/aggregates/cache';
import { UpdateCacheRequestHandler } from '../update-cache-request.handler';

describe(UpdateCacheRequestHandler.name, () => {
  let commandBus: ReturnType<typeof createMockCommandBus>;
  let handler: UpdateCacheRequestHandler;

  beforeEach(() => {
    commandBus = createMockCommandBus();
    handler = new UpdateCacheRequestHandler(commandBus as never);
  });

  it('should return a plain cache object', async () => {
    commandBus.execute.mockResolvedValue(
      Cache.toInstance(createMockCacheEntity({ data: 'updated-data' })),
    );

    const context = {
      entity: 'UserCache',
      params: { id: 'test-id' },
    } as never;
    const dto: CacheUpdatableInterface = {
      data: 'updated-data',
      expiresIn: null,
    };

    const result = await handler.execute(
      new CrudUpdateCommand<CacheInterface, CacheUpdatableInterface>(
        context,
        dto,
      ),
    );

    expect(result).not.toBeInstanceOf(Cache);
    expect(result.data).toBe('updated-data');
  });

  it('should throw when id is not a string', async () => {
    const context = {
      entity: 'UserCache',
      params: { id: 123 },
    } as never;
    const dto: CacheUpdatableInterface = {
      data: 'd',
      expiresIn: null,
    };

    await expect(
      handler.execute(
        new CrudUpdateCommand<CacheInterface, CacheUpdatableInterface>(
          context,
          dto,
        ),
      ),
    ).rejects.toThrow();
  });
});

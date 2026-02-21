import {
  CacheCreatableInterface,
  CacheInterface,
} from '@concepta/nestjs-common';
import { CrudCreateCommand } from '@concepta/nestjs-crud';

import {
  createMockCommandBus,
  createMockCacheEntity,
} from '../../../../../__tests__/helpers/mock.helpers';
import { Cache } from '../../../../../domain/aggregates/cache';
import { CreateCacheRequestHandler } from '../create-cache-request.handler';

describe(CreateCacheRequestHandler.name, () => {
  let commandBus: ReturnType<typeof createMockCommandBus>;
  let handler: CreateCacheRequestHandler;

  beforeEach(() => {
    commandBus = createMockCommandBus();
    handler = new CreateCacheRequestHandler(commandBus as never);
  });

  it('should return a plain cache object', async () => {
    const entity = createMockCacheEntity();
    commandBus.execute.mockResolvedValue(Cache.toInstance(entity));

    const context = { entity: 'UserCache' } as never;
    const dto: CacheCreatableInterface = {
      key: 'test-key',
      type: 'test-type',
      data: 'test-data',
      assigneeId: 'test-assignee',
      expiresIn: '1h',
    };

    const result = await handler.execute(
      new CrudCreateCommand<CacheInterface, CacheCreatableInterface>(
        context,
        dto,
      ),
    );

    expect(result).not.toBeInstanceOf(Cache);
    expect(result.id).toBe('test-id');
    expect(result.key).toBe('test-key');
  });
});

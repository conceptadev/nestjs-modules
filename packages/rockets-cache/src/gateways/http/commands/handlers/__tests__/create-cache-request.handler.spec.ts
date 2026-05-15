import { CrudCreateCommand } from '@concepta/rockets-crud';

import {
  createMockCommandBus,
  createMockCacheContext,
  createMockCacheEntity,
  toCacheDomain,
} from '../../../../../__tests__/helpers/mock.helpers';
import { CreateCacheCommand } from '../../../../../application/commands/impl/create-cache.command';
import { CacheCreatableInterface } from '../../../../../domain/interfaces/cache-creatable.interface';
import { CacheInterface } from '../../../../../domain/interfaces/cache.interface';
import { CreateCacheRequestHandler } from '../create-cache-request.handler';

describe(CreateCacheRequestHandler.name, () => {
  let commandBus: ReturnType<typeof createMockCommandBus>;
  let handler: CreateCacheRequestHandler;

  beforeEach(() => {
    commandBus = createMockCommandBus();
    handler = new CreateCacheRequestHandler(commandBus as never);
  });

  it('should return a plain object from toPlain()', async () => {
    const entity = createMockCacheEntity();
    commandBus.execute.mockResolvedValue(toCacheDomain(entity));

    const context = createMockCacheContext({ entity: 'UserCache' }) as never;
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

    expect(result.id).toBe('test-id');
    expect(result.key).toBe('test-key');
    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.any(CreateCacheCommand),
    );
  });
});

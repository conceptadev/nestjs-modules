import {
  CacheCreatableInterface,
  CacheInterface,
} from '@concepta/nestjs-common';
import { CrudReplaceCommand } from '@concepta/nestjs-crud';

import {
  createMockCommandBus,
  createMockCacheContext,
  createMockCacheEntity,
  toCacheDomain,
} from '../../../../../__tests__/helpers/mock.helpers';
import { ReplaceCacheRequestHandler } from '../replace-cache-request.handler';

describe(ReplaceCacheRequestHandler.name, () => {
  let commandBus: ReturnType<typeof createMockCommandBus>;
  let handler: ReplaceCacheRequestHandler;

  beforeEach(() => {
    commandBus = createMockCommandBus();
    handler = new ReplaceCacheRequestHandler(commandBus as never);
  });

  it('should return a plain object from toPlain()', async () => {
    commandBus.execute.mockResolvedValue(
      toCacheDomain(createMockCacheEntity({ data: 'replaced-data' })),
    );

    const context = createMockCacheContext({
      entity: 'UserCache',
      params: { id: 'test-id' },
    }) as never;
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

    expect(result.data).toBe('replaced-data');
  });

  it('should throw when id is not a string', async () => {
    const context = createMockCacheContext({
      entity: 'UserCache',
      params: { id: undefined },
    }) as never;
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

import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ReplaceCacheCommand } from '../../../../application/commands/impl/replace-cache.command';
import { assertCacheId } from '../../../../application/utils/assert-cache-id.util';
import { ReplaceCacheRequest } from '../impl/replace-cache.request';

@Injectable()
export class ReplaceCacheRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: ReplaceCacheRequest) {
    const { context, dto } = command;
    const { id } = context.params;

    assertCacheId(id);

    const { namespace } = context.withCache();
    const cache = await this.commandBus.execute(
      new ReplaceCacheCommand(context, namespace, id, dto),
    );
    return cache.toPlain();
  }
}

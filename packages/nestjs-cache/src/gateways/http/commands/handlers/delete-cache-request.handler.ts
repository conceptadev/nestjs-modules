import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { Operation } from '@concepta/nestjs-common';

import { ArchiveCacheCommand } from '../../../../application/commands/impl/archive-cache.command';
import { RemoveCacheCommand } from '../../../../application/commands/impl/remove-cache.command';
import { assertCacheId } from '../../../../application/utils/assert-cache-id.util';
import { Cache } from '../../../../domain/aggregates/cache';
import { DeleteCacheRequest } from '../impl/delete-cache.request';

@Injectable()
export class DeleteCacheRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: DeleteCacheRequest) {
    const { context } = command;
    const { id } = context.params;
    const { returnDeleted = false } = context.options?.route ?? {};

    assertCacheId(id);

    let cache: Cache;

    if (context.operation === Operation.SoftDelete) {
      cache = await this.commandBus.execute(
        new ArchiveCacheCommand(context, id),
      );
    } else {
      cache = await this.commandBus.execute(
        new RemoveCacheCommand(context, id),
      );
    }

    return returnDeleted ? cache.toPlain() : null;
  }
}

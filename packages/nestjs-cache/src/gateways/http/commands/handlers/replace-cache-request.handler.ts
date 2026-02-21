import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import {
  CacheCreatableInterface,
  CacheInterface,
} from '@concepta/nestjs-common';
import { CrudReplaceCommand } from '@concepta/nestjs-crud';

import { ReplaceCacheCommand } from '../../../../application/commands/impl/replace-cache.command';
import { assertCacheId } from '../../../../application/utils/assert-cache-id.util';
import { Cache } from '../../../../domain/aggregates/cache';

@Injectable()
export class ReplaceCacheRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudReplaceCommand<CacheInterface, CacheCreatableInterface>,
  ): Promise<CacheInterface> {
    const { context, dto } = command;
    const { id } = context.params;

    assertCacheId(id);

    const cache = await this.commandBus.execute<ReplaceCacheCommand, Cache>(
      new ReplaceCacheCommand(context, id, dto),
    );

    return cache.toPlain();
  }
}

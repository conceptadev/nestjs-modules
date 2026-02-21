import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import {
  CacheInterface,
  CacheUpdatableInterface,
} from '@concepta/nestjs-common';
import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import { UpdateCacheCommand } from '../../../../application/commands/impl/update-cache.command';
import { assertCacheId } from '../../../../application/utils/assert-cache-id.util';
import { Cache } from '../../../../domain/aggregates/cache';

@Injectable()
export class UpdateCacheRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudUpdateCommand<CacheInterface, CacheUpdatableInterface>,
  ): Promise<CacheInterface> {
    const { context, dto } = command;
    const { id } = context.params;

    assertCacheId(id);

    const cache = await this.commandBus.execute<UpdateCacheCommand, Cache>(
      new UpdateCacheCommand(context, id, dto),
    );

    return cache.toPlain();
  }
}

import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import {
  CacheCreatableInterface,
  CacheInterface,
} from '@concepta/nestjs-common';
import { CrudCreateCommand } from '@concepta/nestjs-crud';

import { CreateCacheCommand } from '../../../../application/commands/impl/create-cache.command';
import { Cache } from '../../../../domain/aggregates/cache';

@Injectable()
export class CreateCacheRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudCreateCommand<CacheInterface, CacheCreatableInterface>,
  ): Promise<CacheInterface> {
    const { context, dto } = command;
    const cache = await this.commandBus.execute<CreateCacheCommand, Cache>(
      new CreateCacheCommand(context, dto),
    );
    return cache.toPlain();
  }
}

import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CreateCacheCommand } from '../../../../application/commands/impl/create-cache.command';
import { Cache } from '../../../../domain/aggregates/cache';
import { CreateCacheRequest } from '../impl/create-cache.request';

@Injectable()
export class CreateCacheRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: CreateCacheRequest) {
    const { context, dto } = command;
    const cache = await this.commandBus.execute<CreateCacheCommand, Cache>(
      new CreateCacheCommand(context, dto),
    );
    return cache.toPlain();
  }
}

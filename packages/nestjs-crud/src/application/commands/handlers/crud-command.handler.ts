import { PlainLiteralObject } from '@nestjs/common';

import { CrudAdapter } from '../../../infrastructure/adapters/crud.adapter';
import { CrudCommandHandlerInterface } from '../interfaces/crud-command-handler.interface';
import { CrudCommandInterface } from '../interfaces/crud-command.interface';

/**
 * Base class for CRUD command handlers.
 *
 * This class does NOT implement ICommandHandler directly. The resolver
 * applies the `@CommandHandler` decorator if CQRS is being used.
 */
export class CrudCommandHandler<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> implements CrudCommandHandlerInterface<Entity>
{
  constructor(readonly crudAdapter: CrudAdapter<Entity>) {}

  execute(
    _command: CrudCommandInterface<Entity>,
  ): Promise<Entity | Entity[] | null> {
    throw new Error('Method not implemented');
  }
}

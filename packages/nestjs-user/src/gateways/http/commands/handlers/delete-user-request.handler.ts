import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { UserInterface } from '@concepta/nestjs-common';
import { CrudDeleteCommand } from '@concepta/nestjs-crud';

import { RemoveUserCommand } from '../../../../application/commands/impl/remove-user.command';
import { assertUserId } from '../../../../application/utils/assert-user-id.util';
import { User } from '../../../../domain/aggregates/user';

@Injectable()
export class DeleteUserRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudDeleteCommand<UserInterface>,
  ): Promise<UserInterface | null> {
    const { context } = command;
    const { id } = context.params;
    const { returnDeleted = false } = context.options?.route ?? {};

    assertUserId(id);

    const user = await this.commandBus.execute<RemoveUserCommand, User>(
      new RemoveUserCommand(context, id),
    );

    return returnDeleted ? user.toPlain() : null;
  }
}

import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { UserInterface, UserUpdatableInterface } from '@concepta/nestjs-common';
import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import { UpdateUserCommand } from '../../../../application/commands/impl/update-user.command';
import { assertUserId } from '../../../../application/utils/assert-user-id.util';
import { User } from '../../../../domain/aggregates/user';

@Injectable()
export class UpdateUserRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudUpdateCommand<UserInterface, UserUpdatableInterface>,
  ): Promise<UserInterface> {
    const { context, dto } = command;
    const { id } = context.params;

    assertUserId(id);

    const user = await this.commandBus.execute<UpdateUserCommand, User>(
      new UpdateUserCommand(context, id, dto),
    );

    return user.toPlain();
  }
}

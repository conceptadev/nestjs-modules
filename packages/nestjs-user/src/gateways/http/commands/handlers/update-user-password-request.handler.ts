import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { PasswordUpdateInterface } from '@concepta/nestjs-common';
import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import { UpdateUserPasswordCommand } from '../../../../application/commands/impl/update-user-password.command';
import { assertUserId } from '../../../../application/utils/assert-user-id.util';

@Injectable()
export class UpdateUserPasswordRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudUpdateCommand<
      PasswordUpdateInterface,
      PasswordUpdateInterface
    >,
  ): Promise<null> {
    const { context, dto } = command;
    const id = context.params.id;

    assertUserId(id);

    await this.commandBus.execute(
      new UpdateUserPasswordCommand(context, id, dto),
    );

    return null;
  }
}

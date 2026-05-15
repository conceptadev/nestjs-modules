import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { UpdateUserPasswordCommand } from '../../../../application/commands/impl/update-user-password.command';
import { assertUserId } from '../../../../application/utils/assert-user-id.util';
import { UpdateUserPasswordRequest } from '../impl/update-user-password.request';

@Injectable()
export class UpdateUserPasswordRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: UpdateUserPasswordRequest): Promise<null> {
    const { context, dto } = command;
    const id = context.params.id;

    assertUserId(id);

    await this.commandBus.execute(
      new UpdateUserPasswordCommand(context, id, dto),
    );

    return null;
  }
}

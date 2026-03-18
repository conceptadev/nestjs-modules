import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { RemoveRoleCommand } from '../../../../application/commands/impl/remove-role.command';
import { assertRoleId } from '../../../../application/utils/assert-role-id.util';
import { DeleteRoleRequest } from '../impl/delete-role.request';

@Injectable()
export class DeleteRoleRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: DeleteRoleRequest) {
    const { context } = command;
    const { id } = context.params;

    assertRoleId(id);

    await this.commandBus.execute(new RemoveRoleCommand(context, id));

    return null;
  }
}

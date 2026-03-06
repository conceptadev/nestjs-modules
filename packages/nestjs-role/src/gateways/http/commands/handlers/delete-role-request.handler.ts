import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { RoleInterface } from '@concepta/nestjs-common';
import { CrudDeleteCommand } from '@concepta/nestjs-crud';

import { RemoveRoleCommand } from '../../../../application/commands/impl/remove-role.command';
import { assertRoleId } from '../../../../application/utils/assert-role-id.util';

@Injectable()
export class DeleteRoleRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudDeleteCommand<RoleInterface>,
  ): Promise<RoleInterface | null> {
    const { context } = command;
    const { id } = context.params;

    assertRoleId(id);

    await this.commandBus.execute(new RemoveRoleCommand(context, id));

    return null;
  }
}

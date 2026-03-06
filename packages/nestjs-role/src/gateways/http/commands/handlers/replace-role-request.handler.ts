import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { RoleCreatableInterface, RoleInterface } from '@concepta/nestjs-common';
import { CrudReplaceCommand } from '@concepta/nestjs-crud';

import { ReplaceRoleCommand } from '../../../../application/commands/impl/replace-role.command';
import { assertRoleId } from '../../../../application/utils/assert-role-id.util';
import { Role } from '../../../../domain/aggregates/role';

@Injectable()
export class ReplaceRoleRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudReplaceCommand<RoleInterface, RoleCreatableInterface>,
  ): Promise<RoleInterface> {
    const { context, dto } = command;
    const { id } = context.params;

    assertRoleId(id);

    const role = await this.commandBus.execute<ReplaceRoleCommand, Role>(
      new ReplaceRoleCommand(context, id, dto),
    );

    return role.toPlain();
  }
}

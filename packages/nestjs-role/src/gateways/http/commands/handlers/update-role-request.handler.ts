import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { RoleInterface, RoleUpdatableInterface } from '@concepta/nestjs-common';
import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import { UpdateRoleCommand } from '../../../../application/commands/impl/update-role.command';
import { assertRoleId } from '../../../../application/utils/assert-role-id.util';
import { Role } from '../../../../domain/aggregates/role';

@Injectable()
export class UpdateRoleRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudUpdateCommand<RoleInterface, RoleUpdatableInterface>,
  ): Promise<RoleInterface> {
    const { context, dto } = command;
    const { id } = context.params;

    assertRoleId(id);

    const role = await this.commandBus.execute<UpdateRoleCommand, Role>(
      new UpdateRoleCommand(context, id, dto),
    );

    return role.toPlain();
  }
}

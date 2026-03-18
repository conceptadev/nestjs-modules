import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { UpdateRoleCommand } from '../../../../application/commands/impl/update-role.command';
import { assertRoleId } from '../../../../application/utils/assert-role-id.util';
import { Role } from '../../../../domain/aggregates/role';
import { UpdateRoleRequest } from '../impl/update-role.request';

@Injectable()
export class UpdateRoleRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: UpdateRoleRequest) {
    const { context, dto } = command;
    const { id } = context.params;

    assertRoleId(id);

    const role = await this.commandBus.execute<UpdateRoleCommand, Role>(
      new UpdateRoleCommand(context, id, dto),
    );
    return role.toPlain();
  }
}

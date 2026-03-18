import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { ReplaceRoleCommand } from '../../../../application/commands/impl/replace-role.command';
import { assertRoleId } from '../../../../application/utils/assert-role-id.util';
import { Role } from '../../../../domain/aggregates/role';
import { ReplaceRoleRequest } from '../impl/replace-role.request';

@Injectable()
export class ReplaceRoleRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: ReplaceRoleRequest) {
    const { context, dto } = command;
    const { id } = context.params;

    assertRoleId(id);

    const role = await this.commandBus.execute<ReplaceRoleCommand, Role>(
      new ReplaceRoleCommand(context, id, dto),
    );
    return role.toPlain();
  }
}

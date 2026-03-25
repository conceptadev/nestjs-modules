import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { CreateRoleCommand } from '../../../../application/commands/impl/create-role.command';
import { Role } from '../../../../domain/aggregates/role';
import { CreateRoleRequest } from '../impl/create-role.request';

@Injectable()
export class CreateRoleRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: CreateRoleRequest) {
    const { context, dto } = command;
    const { namespace } = context.withRole();
    const role = await this.commandBus.execute<CreateRoleCommand, Role>(
      new CreateRoleCommand(context, namespace, dto),
    );
    return role.toPlain();
  }
}

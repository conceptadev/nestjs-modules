import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { RoleCreatableInterface, RoleInterface } from '@concepta/nestjs-common';
import { CrudCreateCommand } from '@concepta/nestjs-crud';

import { CreateRoleCommand } from '../../../../application/commands/impl/create-role.command';
import { Role } from '../../../../domain/aggregates/role';

@Injectable()
export class CreateRoleRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudCreateCommand<RoleInterface, RoleCreatableInterface>,
  ): Promise<RoleInterface> {
    const { context, dto } = command;
    const role = await this.commandBus.execute<CreateRoleCommand, Role>(
      new CreateRoleCommand(context, dto),
    );
    return role.toPlain();
  }
}

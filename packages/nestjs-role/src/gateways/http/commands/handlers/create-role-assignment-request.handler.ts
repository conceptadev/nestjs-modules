import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import {
  RoleAssignmentCreatableInterface,
  RoleAssignmentEntityInterface,
} from '@concepta/nestjs-common';
import { CrudCreateCommand } from '@concepta/nestjs-crud';

import { AssignRoleCommand } from '../../../../application/commands/impl/assign-role.command';

@Injectable()
export class CreateRoleAssignmentRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudCreateCommand<
      RoleAssignmentEntityInterface,
      RoleAssignmentCreatableInterface
    >,
  ): Promise<RoleAssignmentEntityInterface> {
    const { context, dto } = command;
    return this.commandBus.execute(
      new AssignRoleCommand(context, dto.roleId, dto.assigneeId),
    );
  }
}

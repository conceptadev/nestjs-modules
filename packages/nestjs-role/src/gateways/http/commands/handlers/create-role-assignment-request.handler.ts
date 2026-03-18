import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AssignRoleCommand } from '../../../../application/commands/impl/assign-role.command';
import { RoleAssignment } from '../../../../domain/aggregates/role-assignment';
import { CreateRoleAssignmentRequest } from '../impl/create-role-assignment.request';

@Injectable()
export class CreateRoleAssignmentRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: CreateRoleAssignmentRequest) {
    const { context, dto } = command;
    const assignment = await this.commandBus.execute<
      AssignRoleCommand,
      RoleAssignment
    >(new AssignRoleCommand(context, dto.roleId, dto.assigneeId));
    return assignment.toPlain();
  }
}

import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { RevokeRoleCommand } from '../../../../application/commands/impl/revoke-role.command';
import { GetRoleAssignmentQuery } from '../../../../application/queries/impl/get-role-assignment.query';
import { assertRoleId } from '../../../../application/utils/assert-role-id.util';
import { RoleAssignment } from '../../../../domain/aggregates/role-assignment';
import { DeleteRoleAssignmentRequest } from '../impl/delete-role-assignment.request';

@Injectable()
export class DeleteRoleAssignmentRequestHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(command: DeleteRoleAssignmentRequest) {
    const { context } = command;
    const { id } = context.params;

    assertRoleId(id);

    const assignment = await this.queryBus.execute<
      GetRoleAssignmentQuery,
      RoleAssignment
    >(new GetRoleAssignmentQuery(context, id));

    await this.commandBus.execute(
      new RevokeRoleCommand(context, assignment.roleId, assignment.assigneeId),
    );

    return null;
  }
}

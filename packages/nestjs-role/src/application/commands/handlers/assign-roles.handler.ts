import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
  RoleAssignmentEntityInterface,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { RoleAssignment } from '../../../domain/aggregates/role-assignment';
import { RoleAssignmentRepositoryResolver } from '../../../infrastructure/persistence/role-assignment-repository.resolver';
import { RoleAssignmentsConflictException } from '../../exceptions/role-assignments-conflict.exception';
import { AssignRolesCommand } from '../impl/assign-roles.command';

@CommandHandler(AssignRolesCommand)
export class AssignRolesHandler implements ICommandHandler<AssignRolesCommand> {
  constructor(
    private readonly repositoryResolver: RoleAssignmentRepositoryResolver,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    command: AssignRolesCommand,
  ): Promise<RoleAssignmentEntityInterface[]> {
    const { ctx, roleIds, assigneeId } = command;

    const assignmentRepo = this.repositoryResolver.resolve(ctx.entity);

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      const existingCount = await assignmentRepo.countByRoleIdsAndAssignee(
        ctx,
        roleIds,
        assigneeId,
      );

      if (existingCount > 0) {
        throw new RoleAssignmentsConflictException(assigneeId);
      }

      const roleAssignments = roleIds.map((roleId) =>
        this.eventPublisher.mergeObjectContext(
          RoleAssignment.create(eventContext, { roleId, assigneeId }),
        ),
      );

      await assignmentRepo.saveMany(ctx, roleAssignments);

      trx.onCommit(ctx, () => roleAssignments.forEach((ra) => ra.commit()));
      trx.onRollback(ctx, () => roleAssignments.forEach((ra) => ra.uncommit()));

      return roleAssignments.map((ra) => ra.toPlain());
    });
  }
}

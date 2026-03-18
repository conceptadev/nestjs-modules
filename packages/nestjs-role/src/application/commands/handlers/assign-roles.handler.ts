import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { RoleAssignment } from '../../../domain/aggregates/role-assignment';
import { RoleAssignmentRepositoryResolverInterface } from '../../../domain/repositories/role-assignment-repository-resolver.interface';
import { ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN } from '../../../role.constants';
import { RoleAssignmentsConflictException } from '../../exceptions/role-assignments-conflict.exception';
import { AssignRolesCommand } from '../impl/assign-roles.command';

@CommandHandler(AssignRolesCommand)
export class AssignRolesHandler implements ICommandHandler<AssignRolesCommand> {
  constructor(
    @Inject(ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: RoleAssignmentRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AssignRolesCommand): Promise<RoleAssignment[]> {
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

      return roleAssignments;
    });
  }
}

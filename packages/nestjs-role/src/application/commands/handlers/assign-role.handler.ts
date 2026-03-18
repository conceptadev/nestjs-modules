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
import { RoleAssignmentConflictException } from '../../exceptions/role-assignment-conflict.exception';
import { AssignRoleCommand } from '../impl/assign-role.command';

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<AssignRoleCommand> {
  constructor(
    @Inject(ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: RoleAssignmentRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: AssignRoleCommand): Promise<RoleAssignment> {
    const { ctx, roleId, assigneeId } = command;

    const assignmentRepo = this.repositoryResolver.resolve(ctx.entity);

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      const count = await assignmentRepo.countByRoleIdAndAssignee(
        ctx,
        roleId,
        assigneeId,
      );

      if (count > 0) {
        throw new RoleAssignmentConflictException(roleId, assigneeId);
      }

      const roleAssignment = this.eventPublisher.mergeObjectContext(
        RoleAssignment.create(eventContext, { roleId, assigneeId }),
      );

      await assignmentRepo.save(ctx, roleAssignment);

      trx.onCommit(ctx, () => roleAssignment.commit());
      trx.onRollback(ctx, () => roleAssignment.uncommit());

      return roleAssignment;
    });
  }
}

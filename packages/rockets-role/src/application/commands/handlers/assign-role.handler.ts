import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/rockets-app';
import { TransactionScope } from '@concepta/rockets-repository';

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
    const { ctx, namespace, roleId, assigneeId } = command;
    const assignmentRepo = this.repositoryResolver.resolve(namespace);

    const eventContext = new EventContextHost({ namespace }, {});

    return this.txScope.run(ctx, async (txCtx) => {
      const count = await assignmentRepo.countByRoleIdAndAssignee(
        txCtx,
        roleId,
        assigneeId,
      );

      if (count > 0) {
        throw new RoleAssignmentConflictException(roleId, assigneeId);
      }

      const roleAssignment = this.eventPublisher.mergeObjectContext(
        RoleAssignment.create(eventContext, { roleId, assigneeId }),
      );

      await assignmentRepo.save(txCtx, roleAssignment);

      txCtx.trx.onCommit(() => roleAssignment.commit());
      txCtx.trx.onRollback(() => roleAssignment.uncommit());

      return roleAssignment;
    });
  }
}

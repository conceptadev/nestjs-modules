import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { RoleAssignmentRepositoryResolverInterface } from '../../../domain/repositories/role-assignment-repository-resolver.interface';
import { ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN } from '../../../role.constants';
import { RevokeRolesCommand } from '../impl/revoke-roles.command';

@CommandHandler(RevokeRolesCommand)
export class RevokeRolesHandler implements ICommandHandler<RevokeRolesCommand> {
  constructor(
    @Inject(ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: RoleAssignmentRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RevokeRolesCommand): Promise<void> {
    const { ctx, namespace, roleIds, assigneeId } = command;
    const assignmentRepo = this.repositoryResolver.resolve(namespace);

    const eventContext = new EventContextHost({ namespace }, {});

    return this.txScope.run(ctx, async (txCtx) => {
      const roleAssignments = await assignmentRepo.findByRoleIdsAndAssignee(
        txCtx,
        roleIds,
        assigneeId,
      );

      const mergedAssignments = roleAssignments.map((ra) => {
        const mergedAssignment = this.eventPublisher.mergeObjectContext(ra);
        mergedAssignment.revoke(eventContext);
        return mergedAssignment;
      });

      await assignmentRepo.removeMany(txCtx, mergedAssignments);

      txCtx.trx.onCommit(() => mergedAssignments.forEach((ra) => ra.commit()));
      txCtx.trx.onRollback(() =>
        mergedAssignments.forEach((ra) => ra.uncommit()),
      );
    });
  }
}

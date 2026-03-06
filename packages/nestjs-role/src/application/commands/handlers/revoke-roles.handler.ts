import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { RoleAssignmentRepositoryResolver } from '../../../infrastructure/persistence/role-assignment-repository.resolver';
import { RevokeRolesCommand } from '../impl/revoke-roles.command';

@CommandHandler(RevokeRolesCommand)
export class RevokeRolesHandler implements ICommandHandler<RevokeRolesCommand> {
  constructor(
    private readonly repositoryResolver: RoleAssignmentRepositoryResolver,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RevokeRolesCommand): Promise<void> {
    const { ctx, roleIds, assigneeId } = command;

    const assignmentRepo = this.repositoryResolver.resolve(ctx.entity);

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      const roleAssignments = await assignmentRepo.findByRoleIdsAndAssignee(
        ctx,
        roleIds,
        assigneeId,
      );

      const mergedAssignments = roleAssignments.map((ra) => {
        const mergedAssignment = this.eventPublisher.mergeObjectContext(ra);
        mergedAssignment.revoke(eventContext);
        return mergedAssignment;
      });

      await assignmentRepo.removeMany(ctx, mergedAssignments);

      trx.onCommit(ctx, () => mergedAssignments.forEach((ra) => ra.commit()));
      trx.onRollback(ctx, () =>
        mergedAssignments.forEach((ra) => ra.uncommit()),
      );
    });
  }
}

import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { RoleAssignmentRepositoryResolver } from '../../../infrastructure/persistence/role-assignment-repository.resolver';
import { RevokeRoleCommand } from '../impl/revoke-role.command';

@CommandHandler(RevokeRoleCommand)
export class RevokeRoleHandler implements ICommandHandler<RevokeRoleCommand> {
  constructor(
    private readonly repositoryResolver: RoleAssignmentRepositoryResolver,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RevokeRoleCommand): Promise<void> {
    const { ctx, roleId, assigneeId } = command;

    const assignmentRepo = this.repositoryResolver.resolve(ctx.entity);

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      const roleAsmnt = await assignmentRepo.findOne(ctx, roleId, assigneeId);

      if (!roleAsmnt) {
        return;
      }

      const roleAsmntMerged = this.eventPublisher.mergeObjectContext(roleAsmnt);
      roleAsmntMerged.revoke(eventContext);

      await assignmentRepo.remove(ctx, roleAsmntMerged);

      trx.onCommit(ctx, () => roleAsmntMerged.commit());
      trx.onRollback(ctx, () => roleAsmntMerged.uncommit());
    });
  }
}

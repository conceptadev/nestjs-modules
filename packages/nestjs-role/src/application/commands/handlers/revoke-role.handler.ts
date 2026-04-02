import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { RoleAssignmentRepositoryResolverInterface } from '../../../domain/repositories/role-assignment-repository-resolver.interface';
import { ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN } from '../../../role.constants';
import { RevokeRoleCommand } from '../impl/revoke-role.command';

@CommandHandler(RevokeRoleCommand)
export class RevokeRoleHandler implements ICommandHandler<RevokeRoleCommand> {
  constructor(
    @Inject(ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: RoleAssignmentRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: RevokeRoleCommand): Promise<void> {
    const { ctx, namespace, roleId, assigneeId } = command;
    const assignmentRepo = this.repositoryResolver.resolve(namespace);

    const eventContext = new EventContextHost({ namespace }, {});

    return this.txScope.run(ctx, async (txCtx) => {
      const roleAsmnt = await assignmentRepo.findOne(txCtx, roleId, assigneeId);

      if (!roleAsmnt) {
        return;
      }

      const roleAsmntMerged = this.eventPublisher.mergeObjectContext(roleAsmnt);
      roleAsmntMerged.revoke(eventContext);

      await assignmentRepo.remove(txCtx, roleAsmntMerged);

      txCtx.trx.onCommit(() => roleAsmntMerged.commit());
      txCtx.trx.onRollback(() => roleAsmntMerged.uncommit());
    });
  }
}

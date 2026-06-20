import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-core';
import { TransactionScope } from '@concepta/nestjs-repository';

import { Role } from '../../../domain/aggregates/role';
import { RoleRepositoryResolverInterface } from '../../../domain/repositories/role-repository-resolver.interface';
import { ROLE_REPOSITORY_RESOLVER_TOKEN } from '../../../role.constants';
import { ReplaceRoleCommand } from '../impl/replace-role.command';

@CommandHandler(ReplaceRoleCommand)
export class ReplaceRoleHandler implements ICommandHandler<ReplaceRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: RoleRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: ReplaceRoleCommand): Promise<Role> {
    const { ctx, namespace, id, dto } = command;
    const roleRepo = this.repositoryResolver.resolve(namespace);

    const eventContext = new EventContextHost({ namespace }, {});

    return this.txScope.run(ctx, async (txCtx) => {
      const existing = await roleRepo.get(txCtx, id);
      let role: Role;

      if (existing) {
        role = this.eventPublisher.mergeObjectContext(existing);
        role.replace(eventContext, dto);
      } else {
        role = this.eventPublisher.mergeObjectContext(
          Role.createWithId(eventContext, String(id), dto),
        );
      }

      await roleRepo.save(txCtx, role);

      txCtx.trx.onCommit(() => role.commit());
      txCtx.trx.onRollback(() => role.uncommit());

      return role;
    });
  }
}

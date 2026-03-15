import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
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
    const { ctx, id, dto } = command;

    const roleRepo = this.repositoryResolver.resolve(ctx.entity);

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      const existing = await roleRepo.get(ctx, id);
      let role: Role;

      if (existing) {
        role = this.eventPublisher.mergeObjectContext(existing);
        role.replace(eventContext, dto);
      } else {
        role = this.eventPublisher.mergeObjectContext(
          Role.createWithId(eventContext, String(id), dto),
        );
      }

      await roleRepo.save(ctx, role);

      trx.onCommit(ctx, () => role.commit());
      trx.onRollback(ctx, () => role.uncommit());

      return role;
    });
  }
}

import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { Role } from '../../../domain/aggregates/role';
import { RoleRepositoryResolverInterface } from '../../../domain/repositories/role-repository-resolver.interface';
import { ROLE_REPOSITORY_RESOLVER_TOKEN } from '../../../role.constants';
import { CreateRoleCommand } from '../impl/create-role.command';

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: RoleRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateRoleCommand): Promise<Role> {
    const { ctx, namespace, dto } = command;
    const roleRepo = this.repositoryResolver.resolve(namespace);

    const eventContext = new EventContextHost({ namespace }, {});

    return this.txScope.run(ctx, async (txCtx) => {
      const role = this.eventPublisher.mergeObjectContext(
        Role.create(eventContext, dto),
      );

      await roleRepo.save(txCtx, role);

      txCtx.trx.onCommit(() => role.commit());
      txCtx.trx.onRollback(() => role.uncommit());

      return role;
    });
  }
}

import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { Role } from '../../../domain/aggregates/role';
import { RoleRepositoryResolver } from '../../../infrastructure/persistence/role-repository.resolver';
import { CreateRoleCommand } from '../impl/create-role.command';

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
  constructor(
    private readonly repositoryResolver: RoleRepositoryResolver,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: CreateRoleCommand): Promise<Role> {
    const { ctx, dto } = command;

    const roleRepo = this.repositoryResolver.resolve(ctx.entity);

    const eventContext = EventContextHost.builder<EntityHeaderInterface>()
      .setHeader('entity', ctx.entity)
      .build();

    return this.txScope.run(ctx, async (trx) => {
      const role = this.eventPublisher.mergeObjectContext(
        Role.create(eventContext, dto),
      );

      await roleRepo.save(ctx, role);

      trx.onCommit(ctx, () => role.commit());
      trx.onRollback(ctx, () => role.uncommit());

      return role;
    });
  }
}

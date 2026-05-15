import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/rockets-repository';

import { RoleRepositoryResolverInterface } from '../../../domain/repositories/role-repository-resolver.interface';
import { ROLE_REPOSITORY_RESOLVER_TOKEN } from '../../../role.constants';
import { RoleNotFoundException } from '../../exceptions/role-not-found.exception';
import { RemoveRoleCommand } from '../impl/remove-role.command';

@CommandHandler(RemoveRoleCommand)
export class RemoveRoleHandler implements ICommandHandler<RemoveRoleCommand> {
  constructor(
    @Inject(ROLE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: RoleRepositoryResolverInterface,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: RemoveRoleCommand): Promise<void> {
    const { ctx, namespace, id } = command;
    const roleRepo = this.repositoryResolver.resolve(namespace);

    return this.txScope.run(ctx, async (txCtx) => {
      const role = await roleRepo.get(txCtx, id);

      if (!role) {
        throw new RoleNotFoundException({ id: String(id) });
      }

      await roleRepo.remove(txCtx, role);
    });
  }
}

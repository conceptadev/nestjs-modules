import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { TransactionScope } from '@concepta/nestjs-repository';

import { RoleRepositoryResolver } from '../../../infrastructure/persistence/role-repository.resolver';
import { RoleNotFoundException } from '../../exceptions/role-not-found.exception';
import { RemoveRoleCommand } from '../impl/remove-role.command';

@CommandHandler(RemoveRoleCommand)
export class RemoveRoleHandler implements ICommandHandler<RemoveRoleCommand> {
  constructor(
    private readonly repositoryResolver: RoleRepositoryResolver,
    private readonly txScope: TransactionScope,
  ) {}

  async execute(command: RemoveRoleCommand): Promise<void> {
    const { ctx, id } = command;

    const roleRepo = this.repositoryResolver.resolve(ctx.entity);

    return this.txScope.run(ctx, async () => {
      const role = await roleRepo.get(ctx, id);

      if (!role) {
        throw new RoleNotFoundException({ id: String(id) });
      }

      await roleRepo.remove(ctx, role);
    });
  }
}

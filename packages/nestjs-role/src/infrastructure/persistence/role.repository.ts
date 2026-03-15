import {
  ReferenceId,
  RepositoryContextInterface,
  RepositoryInterface,
  RoleEntityInterface,
  Where,
} from '@concepta/nestjs-common';

import { Role } from '../../domain/aggregates/role';
import { RoleRepositoryInterface } from '../../domain/repositories/role-repository.interface';

export class RoleRepository implements RoleRepositoryInterface {
  constructor(
    protected readonly repository: RepositoryInterface<RoleEntityInterface>,
  ) {}

  async get(
    ctx: RepositoryContextInterface,
    id: ReferenceId,
  ): Promise<Role | null> {
    const w = Where.for<RoleEntityInterface>();

    const entity = await this.repository.findOne({
      where: w.eq('id', id),
      ctx,
    });

    return entity ? Role.toInstance(entity) : null;
  }

  async save(ctx: RepositoryContextInterface, role: Role): Promise<void> {
    const entity = await this.repository.upsert(role.toPlain(), { ctx });
    role.hydrate(entity);
  }

  async remove(ctx: RepositoryContextInterface, role: Role): Promise<void> {
    await this.repository.delete(role.toPlain(), { ctx });
  }
}

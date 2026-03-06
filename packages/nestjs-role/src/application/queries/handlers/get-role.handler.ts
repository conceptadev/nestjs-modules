import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Role } from '../../../domain/aggregates/role';
import { RoleRepositoryResolver } from '../../../infrastructure/persistence/role-repository.resolver';
import { RoleNotFoundException } from '../../exceptions/role-not-found.exception';
import { GetRoleQuery } from '../impl/get-role.query';

@QueryHandler(GetRoleQuery)
export class GetRoleHandler implements IQueryHandler<GetRoleQuery> {
  constructor(private readonly repositoryResolver: RoleRepositoryResolver) {}

  async execute(query: GetRoleQuery): Promise<Role> {
    const { ctx, id } = query;

    const roleRepo = this.repositoryResolver.resolve(ctx.entity);

    const role = await roleRepo.get(ctx, id);

    if (!role) {
      throw new RoleNotFoundException({ id: String(id) });
    }

    return role;
  }
}

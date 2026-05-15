import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Role } from '../../../domain/aggregates/role';
import { RoleRepositoryResolverInterface } from '../../../domain/repositories/role-repository-resolver.interface';
import { ROLE_REPOSITORY_RESOLVER_TOKEN } from '../../../role.constants';
import { RoleNotFoundException } from '../../exceptions/role-not-found.exception';
import { GetRoleQuery } from '../impl/get-role.query';

@QueryHandler(GetRoleQuery)
export class GetRoleHandler implements IQueryHandler<GetRoleQuery> {
  constructor(
    @Inject(ROLE_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: RoleRepositoryResolverInterface,
  ) {}

  async execute(query: GetRoleQuery): Promise<Role> {
    const { ctx, namespace, id } = query;

    const roleRepo = this.repositoryResolver.resolve(namespace);

    const role = await roleRepo.get(ctx, id);

    if (!role) {
      throw new RoleNotFoundException({ id: String(id) });
    }

    return role;
  }
}

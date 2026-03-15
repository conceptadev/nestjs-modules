import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RoleAssignment } from '../../../domain/aggregates/role-assignment';
import { RoleAssignmentRepositoryResolverInterface } from '../../../domain/repositories/role-assignment-repository-resolver.interface';
import { ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN } from '../../../role.constants';
import { GetAssignedRolesQuery } from '../impl/get-assigned-roles.query';

@QueryHandler(GetAssignedRolesQuery)
export class GetAssignedRolesHandler
  implements IQueryHandler<GetAssignedRolesQuery>
{
  constructor(
    @Inject(ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: RoleAssignmentRepositoryResolverInterface,
  ) {}

  async execute(query: GetAssignedRolesQuery): Promise<RoleAssignment[]> {
    const { ctx, assigneeId } = query;

    const assignmentRepo = this.repositoryResolver.resolve(ctx.entity);

    return assignmentRepo.findByAssignee(ctx, assigneeId);
  }
}

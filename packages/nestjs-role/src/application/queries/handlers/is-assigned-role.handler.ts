import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RoleAssignmentRepositoryResolverInterface } from '../../../domain/repositories/role-assignment-repository-resolver.interface';
import { ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN } from '../../../role.constants';
import { IsAssignedRoleQuery } from '../impl/is-assigned-role.query';

@QueryHandler(IsAssignedRoleQuery)
export class IsAssignedRoleHandler
  implements IQueryHandler<IsAssignedRoleQuery>
{
  constructor(
    @Inject(ROLE_ASSIGNMENT_REPOSITORY_RESOLVER_TOKEN)
    private readonly repositoryResolver: RoleAssignmentRepositoryResolverInterface,
  ) {}

  async execute(query: IsAssignedRoleQuery): Promise<boolean> {
    const { ctx, roleId, assigneeId } = query;

    const assignmentRepo = this.repositoryResolver.resolve(ctx.entity);

    const count = await assignmentRepo.countByRoleIdAndAssignee(
      ctx,
      roleId,
      assigneeId,
    );

    return count > 0;
  }
}

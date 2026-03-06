import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RoleAssignmentRepositoryResolver } from '../../../infrastructure/persistence/role-assignment-repository.resolver';
import { IsAssignedRolesQuery } from '../impl/is-assigned-roles.query';

@QueryHandler(IsAssignedRolesQuery)
export class IsAssignedRolesHandler
  implements IQueryHandler<IsAssignedRolesQuery>
{
  constructor(
    private readonly repositoryResolver: RoleAssignmentRepositoryResolver,
  ) {}

  async execute(query: IsAssignedRolesQuery): Promise<boolean> {
    const { ctx, roleIds, assigneeId } = query;

    if (roleIds.length === 0) {
      return false;
    }

    const assignmentRepo = this.repositoryResolver.resolve(ctx.entity);

    const count = await assignmentRepo.countByRoleIdsAndAssignee(
      ctx,
      roleIds,
      assigneeId,
    );

    return count === roleIds.length;
  }
}

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RoleAssignmentRepositoryResolver } from '../../../infrastructure/persistence/role-assignment-repository.resolver';
import { IsAssignedRoleQuery } from '../impl/is-assigned-role.query';

@QueryHandler(IsAssignedRoleQuery)
export class IsAssignedRoleHandler
  implements IQueryHandler<IsAssignedRoleQuery>
{
  constructor(
    private readonly repositoryResolver: RoleAssignmentRepositoryResolver,
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

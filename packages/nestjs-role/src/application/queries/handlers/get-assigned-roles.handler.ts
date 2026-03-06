import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RoleAssignment } from '../../../domain/aggregates/role-assignment';
import { RoleAssignmentRepositoryResolver } from '../../../infrastructure/persistence/role-assignment-repository.resolver';
import { GetAssignedRolesQuery } from '../impl/get-assigned-roles.query';

@QueryHandler(GetAssignedRolesQuery)
export class GetAssignedRolesHandler
  implements IQueryHandler<GetAssignedRolesQuery>
{
  constructor(
    private readonly repositoryResolver: RoleAssignmentRepositoryResolver,
  ) {}

  async execute(query: GetAssignedRolesQuery): Promise<RoleAssignment[]> {
    const { ctx, assigneeId } = query;

    const assignmentRepo = this.repositoryResolver.resolve(ctx.entity);

    return assignmentRepo.findByAssignee(ctx, assigneeId);
  }
}

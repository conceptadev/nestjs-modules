import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { RoleAssignment } from '../../../domain/aggregates/role-assignment';
import { RoleAssignmentRepositoryResolver } from '../../../infrastructure/persistence/role-assignment-repository.resolver';
import { RoleAssignmentNotFoundException } from '../../exceptions/role-assignment-not-found.exception';
import { GetRoleAssignmentQuery } from '../impl/get-role-assignment.query';

@QueryHandler(GetRoleAssignmentQuery)
export class GetRoleAssignmentHandler
  implements IQueryHandler<GetRoleAssignmentQuery>
{
  constructor(
    private readonly repositoryResolver: RoleAssignmentRepositoryResolver,
  ) {}

  async execute(query: GetRoleAssignmentQuery): Promise<RoleAssignment> {
    const { ctx, id } = query;

    const assignmentRepo = this.repositoryResolver.resolve(ctx.entity);

    const assignment = await assignmentRepo.get(ctx, id);

    if (!assignment) {
      throw new RoleAssignmentNotFoundException(String(id));
    }

    return assignment;
  }
}

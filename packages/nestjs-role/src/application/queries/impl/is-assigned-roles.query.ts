import { RepositoryContextInterface } from '@concepta/nestjs-common';

export class IsAssignedRolesQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly roleIds: string[],
    public readonly assigneeId: string,
  ) {}
}

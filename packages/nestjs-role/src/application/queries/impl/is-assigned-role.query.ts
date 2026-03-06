import { RepositoryContextInterface } from '@concepta/nestjs-common';

export class IsAssignedRoleQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly roleId: string,
    public readonly assigneeId: string,
  ) {}
}

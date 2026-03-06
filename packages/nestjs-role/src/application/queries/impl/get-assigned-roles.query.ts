import { RepositoryContextInterface } from '@concepta/nestjs-common';

export class GetAssignedRolesQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly assigneeId: string,
  ) {}
}

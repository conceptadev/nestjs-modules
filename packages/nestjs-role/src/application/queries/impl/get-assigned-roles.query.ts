import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class GetAssignedRolesQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly assigneeId: string,
  ) {}
}

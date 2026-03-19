import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class FindCachesByAssigneeQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly assigneeId: string,
  ) {}
}

import { RepositoryContextInterface } from '@concepta/nestjs-common';

export class FindCachesByAssigneeQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly assigneeId: string,
  ) {}
}

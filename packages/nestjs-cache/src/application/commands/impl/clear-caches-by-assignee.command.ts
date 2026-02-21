import { RepositoryContextInterface } from '@concepta/nestjs-common';

export class ClearCachesByAssigneeCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly assigneeId: string,
  ) {}
}

import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class ClearCachesByAssigneeCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly assigneeId: string,
  ) {}
}

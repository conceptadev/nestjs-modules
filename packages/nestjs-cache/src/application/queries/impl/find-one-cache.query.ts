import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class FindOneCacheQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly key: string,
    public readonly type: string,
    public readonly assigneeId: string,
  ) {}
}

import { CacheCreatableInterface } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class UpsertCacheCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly dto: CacheCreatableInterface,
  ) {}
}

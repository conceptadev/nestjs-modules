import {
  CacheCreatableInterface,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class UpsertCacheCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly dto: CacheCreatableInterface,
  ) {}
}

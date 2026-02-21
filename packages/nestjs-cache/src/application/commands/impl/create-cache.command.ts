import {
  CacheCreatableInterface,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class CreateCacheCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly dto: CacheCreatableInterface,
  ) {}
}

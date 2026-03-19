import { CacheCreatableInterface } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class CreateCacheCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly dto: CacheCreatableInterface,
  ) {}
}

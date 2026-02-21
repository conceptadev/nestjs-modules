import {
  CacheCreatableInterface,
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class ReplaceCacheCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
    public readonly dto: CacheCreatableInterface,
  ) {}
}

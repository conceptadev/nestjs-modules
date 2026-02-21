import {
  CacheUpdatableInterface,
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class UpdateCacheCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
    public readonly dto: CacheUpdatableInterface,
  ) {}
}

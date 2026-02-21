import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class RemoveCacheCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
  ) {}
}

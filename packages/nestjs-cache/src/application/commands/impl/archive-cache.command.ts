import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class ArchiveCacheCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
  ) {}
}

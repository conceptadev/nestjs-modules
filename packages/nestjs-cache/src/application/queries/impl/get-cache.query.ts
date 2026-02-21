import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class GetCacheQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
  ) {}
}

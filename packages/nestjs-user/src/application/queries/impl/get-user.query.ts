import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class GetUserQuery {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
  ) {}
}

import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class RemoveRoleCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
  ) {}
}

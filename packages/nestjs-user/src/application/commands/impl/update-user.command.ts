import {
  ReferenceId,
  RepositoryContextInterface,
  UserUpdatableInterface,
} from '@concepta/nestjs-common';

export class UpdateUserCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
    public readonly dto: Partial<UserUpdatableInterface>,
  ) {}
}

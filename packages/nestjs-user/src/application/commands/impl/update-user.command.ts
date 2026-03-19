import { ReferenceId, UserUpdatableInterface } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class UpdateUserCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
    public readonly dto: Partial<UserUpdatableInterface>,
  ) {}
}

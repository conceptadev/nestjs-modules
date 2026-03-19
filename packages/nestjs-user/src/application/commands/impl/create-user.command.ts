import { UserCreatableInterface } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class CreateUserCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly dto: UserCreatableInterface,
  ) {}
}

import {
  RepositoryContextInterface,
  UserCreatableInterface,
} from '@concepta/nestjs-common';

export class CreateUserCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly dto: UserCreatableInterface,
  ) {}
}

import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class CreateUserCredentialCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly userId: ReferenceId,
    public readonly password: string,
  ) {}
}

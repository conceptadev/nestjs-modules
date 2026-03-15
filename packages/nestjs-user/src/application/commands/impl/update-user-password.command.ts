import {
  ReferenceId,
  RepositoryContextInterface,
  PasswordUpdateInterface,
} from '@concepta/nestjs-common';

export class UpdateUserPasswordCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly userId: ReferenceId,
    public readonly passwordDto: PasswordUpdateInterface,
  ) {}
}

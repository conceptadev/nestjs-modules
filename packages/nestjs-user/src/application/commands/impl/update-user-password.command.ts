import { PasswordUpdateInterface, ReferenceId } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class UpdateUserPasswordCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly userId: ReferenceId,
    public readonly passwordDto: PasswordUpdateInterface,
  ) {}
}

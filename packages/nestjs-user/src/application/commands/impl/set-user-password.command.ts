import { ReferenceId } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class SetUserPasswordCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly userId: ReferenceId,
    public readonly password: string,
  ) {}
}

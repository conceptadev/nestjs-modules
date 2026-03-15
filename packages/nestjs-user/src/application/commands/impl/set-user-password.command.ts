import {
  ReferenceId,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';

export class SetUserPasswordCommand {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly userId: ReferenceId,
    public readonly password: string,
  ) {}
}

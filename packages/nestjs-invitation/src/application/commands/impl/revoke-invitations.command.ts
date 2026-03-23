import { Command } from '@nestjs/cqrs';

import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class RevokeInvitationsCommand extends Command<void> {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly email: string,
    public readonly category: string,
  ) {
    super();
  }
}

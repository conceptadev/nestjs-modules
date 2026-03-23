import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-common';
import { RepositoryContextInterface } from '@concepta/nestjs-repository';

export class SendInvitationCommand extends Command<void> {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly id: ReferenceId,
  ) {
    super();
  }
}

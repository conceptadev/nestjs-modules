import { Command } from '@nestjs/cqrs';

import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { Invitation } from '../../../domain/aggregates/invitation';
import { InvitationAcceptableInterface } from '../../../domain/interfaces/invitation-acceptable.interface';

export class AcceptInvitationCommand extends Command<Invitation | null> {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly code: string,
    public readonly dto: InvitationAcceptableInterface,
  ) {
    super();
  }
}

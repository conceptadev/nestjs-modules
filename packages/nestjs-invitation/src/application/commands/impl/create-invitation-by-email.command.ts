import { Command } from '@nestjs/cqrs';

import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { Invitation } from '../../../domain/aggregates/invitation';
import { InvitationCreatableByEmailInterface } from '../../../domain/interfaces/invitation-creatable-by-email.interface';

export class CreateInvitationByEmailCommand extends Command<Invitation> {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly dto: InvitationCreatableByEmailInterface,
  ) {
    super();
  }
}

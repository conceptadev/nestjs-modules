import { Command } from '@nestjs/cqrs';

import { RepositoryContextInterface } from '@concepta/nestjs-repository';

import { Invitation } from '../../../domain/aggregates/invitation';
import { InvitationCreatableInterface } from '../../../domain/interfaces/invitation-creatable.interface';

export class CreateInvitationCommand extends Command<Invitation> {
  constructor(
    public readonly ctx: RepositoryContextInterface,
    public readonly dto: InvitationCreatableInterface,
  ) {
    super();
  }
}

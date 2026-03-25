import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { Invitation } from '../../../domain/aggregates/invitation';
import { InvitationCreatableByEmailInterface } from '../../../domain/interfaces/invitation-creatable-by-email.interface';

export class CreateInvitationByEmailCommand extends Command<Invitation> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly dto: InvitationCreatableByEmailInterface,
  ) {
    super();
  }
}

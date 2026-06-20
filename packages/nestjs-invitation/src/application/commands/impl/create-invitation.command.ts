import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { Invitation } from '../../../domain/aggregates/invitation';
import { InvitationCreatableInterface } from '../../../domain/interfaces/invitation-creatable.interface';

export class CreateInvitationCommand extends Command<Invitation> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly dto: InvitationCreatableInterface,
  ) {
    super();
  }
}

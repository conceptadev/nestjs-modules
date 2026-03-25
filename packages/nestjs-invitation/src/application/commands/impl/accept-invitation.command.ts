import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { Invitation } from '../../../domain/aggregates/invitation';
import { InvitationAcceptableInterface } from '../../../domain/interfaces/invitation-acceptable.interface';

export class AcceptInvitationCommand extends Command<Invitation | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly code: string,
    public readonly dto: InvitationAcceptableInterface,
  ) {
    super();
  }
}

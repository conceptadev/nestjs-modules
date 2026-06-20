import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-core';

import { Invitation } from '../../../domain/aggregates/invitation';

export class RemoveInvitationCommand extends Command<Invitation> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly id: ReferenceId,
  ) {
    super();
  }
}

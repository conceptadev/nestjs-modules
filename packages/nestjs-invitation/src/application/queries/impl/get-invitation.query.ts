import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-core';

import { Invitation } from '../../../domain/aggregates/invitation';

export class GetInvitationQuery extends Query<Invitation | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly id: ReferenceId,
  ) {
    super();
  }
}

import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-common';

import { AuthenticatedResponseInterface } from '../../../domain/interfaces/authenticated-response.interface';

export class IssueAuthenticatedResponseCommand extends Command<AuthenticatedResponseInterface> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly id: ReferenceId,
  ) {
    super();
  }
}

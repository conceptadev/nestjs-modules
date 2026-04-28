import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-common';

import { UserCredentials } from '../../../domain/aggregates/user-credentials';

export class SetUserPasswordCommand extends Command<UserCredentials> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly userId: ReferenceId,
    public readonly password: string,
  ) {
    super();
  }
}

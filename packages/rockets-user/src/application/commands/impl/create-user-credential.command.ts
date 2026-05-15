import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/rockets-app';

import { UserCredentials } from '../../../domain/aggregates/user-credentials';

export class CreateUserCredentialCommand extends Command<UserCredentials> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly userId: ReferenceId,
    public readonly password: string,
  ) {
    super();
  }
}

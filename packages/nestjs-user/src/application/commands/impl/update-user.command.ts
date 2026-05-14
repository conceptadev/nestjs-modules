import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/rockets-app';

import { User } from '../../../domain/aggregates/user';
import { UserUpdatableInterface } from '../../../domain/interfaces/user-updatable.interface';

export class UpdateUserCommand extends Command<User> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly id: ReferenceId,
    public readonly dto: Partial<UserUpdatableInterface>,
  ) {
    super();
  }
}

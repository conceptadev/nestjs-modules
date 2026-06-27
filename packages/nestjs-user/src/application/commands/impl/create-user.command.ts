import { type PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { type User } from '../../../domain/aggregates/user';
import { type UserCreatableInterface } from '../../../domain/interfaces/user-creatable.interface';

export class CreateUserCommand extends Command<User> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly dto: UserCreatableInterface,
  ) {
    super();
  }
}

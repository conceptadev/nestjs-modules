import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { ReferenceUsername } from '@concepta/rockets-app';

import { User } from '../../../domain/aggregates/user';

export class GetUserByUsernameQuery extends Query<User | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly username: ReferenceUsername,
  ) {
    super();
  }
}

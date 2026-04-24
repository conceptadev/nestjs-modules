import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { ReferenceUsername } from '@concepta/nestjs-common';

import { User } from '../../../domain/aggregates/user';

export class GetUserByUsernameQuery extends Query<User | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly username: ReferenceUsername,
  ) {
    super();
  }
}

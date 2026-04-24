import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { ReferenceEmail } from '@concepta/nestjs-common';

import { User } from '../../../domain/aggregates/user';

export class GetUserByEmailQuery extends Query<User | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly email: ReferenceEmail,
  ) {
    super();
  }
}

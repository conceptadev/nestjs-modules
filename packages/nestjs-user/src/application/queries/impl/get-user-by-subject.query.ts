import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { ReferenceSubject } from '@concepta/nestjs-common';

import { User } from '../../../domain/aggregates/user';

export class GetUserBySubjectQuery extends Query<User | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly subject: ReferenceSubject,
  ) {
    super();
  }
}

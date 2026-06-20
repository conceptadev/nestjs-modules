import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { ReferenceId } from '@concepta/nestjs-core';

import { User } from '../../../domain/aggregates/user';

export class GetUserQuery extends Query<User | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly id: ReferenceId,
  ) {
    super();
  }
}

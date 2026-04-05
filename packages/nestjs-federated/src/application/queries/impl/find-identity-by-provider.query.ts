import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { Identity } from '../../../domain/aggregates/identity';

export class FindIdentityByProviderQuery extends Query<Identity | null> {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly provider: string,
    public readonly subject: string,
  ) {
    super();
  }
}

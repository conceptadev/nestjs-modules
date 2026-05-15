import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { ValidateTokenQueryInterface } from '../../../domain/ports/token.port';

export class ValidateTokenQuery
  extends Query<boolean>
  implements ValidateTokenQueryInterface
{
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly payload: PlainLiteralObject,
  ) {
    super();
  }
}

import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { VerifyTokenQueryInterface } from '../../../domain/ports/token.port';

export class VerifyRefreshTokenQuery
  extends Query<PlainLiteralObject>
  implements VerifyTokenQueryInterface
{
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly token: string,
  ) {
    super();
  }
}

import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';

import { JwtVerifyTokenQueryInterface } from '../../../domain/ports/jwt.port';

export class JwtVerifyRefreshTokenQuery
  extends Query<PlainLiteralObject>
  implements JwtVerifyTokenQueryInterface
{
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly token: string,
  ) {
    super();
  }
}

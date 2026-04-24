import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { Token } from '../../../domain/aggregates/token.aggregate';
import { SignTokenCommandInterface } from '../../../domain/ports/jwt.port';

export class SignRefreshTokenCommand
  extends Command<string>
  implements SignTokenCommandInterface
{
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly token: Token,
  ) {
    super();
  }
}

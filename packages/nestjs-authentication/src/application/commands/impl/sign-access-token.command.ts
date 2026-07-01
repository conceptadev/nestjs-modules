import { type PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { type Token } from '../../../domain/aggregates/token.aggregate';
import { type SignTokenCommandInterface } from '../../../domain/ports/jwt.port';

export class SignAccessTokenCommand
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

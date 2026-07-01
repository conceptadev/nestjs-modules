import { type PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { type AuthorizationPayloadInterface } from '../../../domain/interfaces/authorization-payload.interface';
import { type IssueTokenCommandInterface } from '../../../domain/ports/token.port';

export class IssueAccessTokenCommand
  extends Command<string>
  implements IssueTokenCommandInterface
{
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly payload: AuthorizationPayloadInterface,
  ) {
    super();
  }
}

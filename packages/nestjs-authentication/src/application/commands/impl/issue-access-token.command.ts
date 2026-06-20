import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';

import { AuthorizationPayloadInterface } from '../../../domain/interfaces/authorization-payload.interface';
import { IssueTokenCommandInterface } from '../../../domain/ports/token.port';

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

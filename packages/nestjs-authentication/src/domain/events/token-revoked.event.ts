import { type IEvent } from '@nestjs/cqrs';

import { type EventContextHost } from '@concepta/nestjs-core';

import { type TokenInterface } from '../interfaces/token.interface';

export class TokenRevokedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost,
    public readonly token: TokenInterface & { id: string },
  ) {}
}

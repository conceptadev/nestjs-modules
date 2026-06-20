import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-core';

import { TokenInterface } from '../interfaces/token.interface';

export class TokenRevokedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost,
    public readonly token: TokenInterface & { id: string },
  ) {}
}

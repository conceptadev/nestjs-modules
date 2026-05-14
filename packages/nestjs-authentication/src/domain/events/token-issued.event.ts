import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/rockets-app';

import { TokenInterface } from '../interfaces/token.interface';

export class TokenIssuedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost,
    public readonly token: TokenInterface & { id: string },
    public readonly refreshedFrom?: string,
  ) {}
}

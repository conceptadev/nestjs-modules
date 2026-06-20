import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-core';

import { IdentityInterface } from '../interfaces/identity.interface';

export class IdentityCreatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost,
    public readonly identity: IdentityInterface,
  ) {}
}

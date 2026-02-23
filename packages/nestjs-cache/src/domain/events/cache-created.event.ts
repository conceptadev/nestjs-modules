import { IEvent } from '@nestjs/cqrs';

import {
  CacheInterface,
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';

export class CacheCreatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<EntityHeaderInterface>,
    public readonly cache: CacheInterface,
  ) {}
}

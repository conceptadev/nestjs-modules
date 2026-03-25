import { IEvent } from '@nestjs/cqrs';

import { CacheInterface, EventContextHost } from '@concepta/nestjs-common';

import { CacheEventHeaderInterface } from './interfaces/cache-event-header.interface';

export class CacheReplacedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<CacheEventHeaderInterface>,
    public readonly cache: CacheInterface,
  ) {}
}

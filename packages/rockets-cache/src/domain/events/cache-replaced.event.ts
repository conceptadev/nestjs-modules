import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/rockets-app';

import { CacheInterface } from '../interfaces/cache.interface';

import { CacheEventHeaderInterface } from './interfaces/cache-event-header.interface';

export class CacheReplacedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<CacheEventHeaderInterface>,
    public readonly cache: CacheInterface,
  ) {}
}

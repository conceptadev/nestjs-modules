import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';

import { CacheInterface } from '../interfaces/cache.interface';

import { CacheEventHeaderInterface } from './interfaces/cache-event-header.interface';

export class CacheUpdatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<CacheEventHeaderInterface>,
    public readonly cache: CacheInterface,
  ) {}
}

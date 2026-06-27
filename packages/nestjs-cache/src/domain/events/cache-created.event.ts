import { type IEvent } from '@nestjs/cqrs';

import { type EventContextHost } from '@concepta/nestjs-core';

import { type CacheInterface } from '../interfaces/cache.interface';

import { type CacheEventHeaderInterface } from './interfaces/cache-event-header.interface';

export class CacheCreatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<CacheEventHeaderInterface>,
    public readonly cache: CacheInterface,
  ) {}
}

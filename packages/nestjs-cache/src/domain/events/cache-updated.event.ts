import { IEvent } from '@nestjs/cqrs';

import { CacheInterface } from '@concepta/nestjs-common';

export class CacheUpdatedEvent implements IEvent {
  constructor(public readonly cache: CacheInterface) {}
}

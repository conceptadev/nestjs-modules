import { IEvent } from '@nestjs/cqrs';

import { CacheInterface } from '@concepta/nestjs-common';

export class CacheCreatedEvent implements IEvent {
  constructor(public readonly cache: CacheInterface) {}
}

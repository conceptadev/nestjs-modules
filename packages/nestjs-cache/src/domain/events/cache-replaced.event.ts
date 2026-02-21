import { IEvent } from '@nestjs/cqrs';

import { CacheInterface } from '@concepta/nestjs-common';

export class CacheReplacedEvent implements IEvent {
  constructor(public readonly cache: CacheInterface) {}
}

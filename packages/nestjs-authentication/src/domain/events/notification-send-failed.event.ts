import { type PlainLiteralObject, type Type } from '@nestjs/common';
import { type Command, type IEvent } from '@nestjs/cqrs';

import { type ReferenceEmail } from '@concepta/nestjs-core';

export class NotificationSendFailedEvent implements IEvent {
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly email: ReferenceEmail,
    public readonly command: Type<Command<void>>,
    public readonly error: unknown,
  ) {}
}

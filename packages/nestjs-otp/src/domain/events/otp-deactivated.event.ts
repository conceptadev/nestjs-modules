import { IEvent } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
  OtpInterface,
} from '@concepta/nestjs-common';

export class OtpDeactivatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<EntityHeaderInterface>,
    public readonly otp: OtpInterface,
  ) {}
}

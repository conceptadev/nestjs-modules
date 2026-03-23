import { IEvent } from '@nestjs/cqrs';

import { EventContextHost, OtpInterface } from '@concepta/nestjs-common';

import { OtpEventHeaderInterface } from './interfaces/otp-event-header.interface';

export class OtpConsumedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<OtpEventHeaderInterface>,
    public readonly otp: OtpInterface,
  ) {}
}

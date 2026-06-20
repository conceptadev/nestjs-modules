import { IEvent } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-core';

import { OtpInterface } from '../interfaces/otp.interface';

import { OtpEventHeaderInterface } from './interfaces/otp-event-header.interface';

export class OtpDeactivatedEvent implements IEvent {
  constructor(
    public readonly eventContext: EventContextHost<OtpEventHeaderInterface>,
    public readonly otp: OtpInterface,
  ) {}
}

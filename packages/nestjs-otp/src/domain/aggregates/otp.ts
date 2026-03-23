import { randomUUID } from 'crypto';

import {
  DomainFactory,
  EventContextHost,
  OtpInterface,
} from '@concepta/nestjs-common';
import { DomainAggregate } from '@concepta/nestjs-common/aggregate';

import { OtpEventHeaderInterface } from '../events/interfaces/otp-event-header.interface';
import { OtpConsumedEvent } from '../events/otp-consumed.event';
import { OtpCreatedEvent } from '../events/otp-created.event';
import { OtpDeactivatedEvent } from '../events/otp-deactivated.event';
import { getExpirationDate } from '../utils/get-expiration-date.util';

export interface OtpCreateProps {
  category: string;
  type: string;
  assigneeId: string;
  passcode: string;
  expiresIn: string;
}

export class Otp extends DomainAggregate<OtpInterface> {
  get category() {
    return this.props.category;
  }

  get type() {
    return this.props.type;
  }

  get passcode() {
    return this.props.passcode;
  }

  get assigneeId() {
    return this.props.assigneeId;
  }

  get expirationDate() {
    return this.props.expirationDate;
  }

  get active() {
    return this.props.active;
  }

  static create(
    eventContext: EventContextHost<OtpEventHeaderInterface>,
    props: OtpCreateProps,
  ): Otp {
    return Otp.createWithId(eventContext, randomUUID(), props);
  }

  static createWithId(
    eventContext: EventContextHost<OtpEventHeaderInterface>,
    id: string,
    props: OtpCreateProps,
  ): Otp {
    const { category, type, assigneeId, passcode, expiresIn } = props;
    const now = new Date();

    const otp = new Otp(id, {
      category,
      type,
      assigneeId,
      passcode,
      expirationDate: getExpirationDate(expiresIn, now),
      active: true,
    });

    otp.apply(new OtpCreatedEvent(eventContext, otp.toPlain()));

    return otp;
  }

  deactivate(eventContext: EventContextHost<OtpEventHeaderInterface>): void {
    this.props = {
      ...this.props,
      active: false,
    };

    this.incrementVersion();

    this.apply(new OtpDeactivatedEvent(eventContext, this.toPlain()));
  }

  consume(eventContext: EventContextHost<OtpEventHeaderInterface>): void {
    this.apply(new OtpConsumedEvent(eventContext, this.toPlain()));
  }

  isExpired(now: Date = new Date()): boolean {
    return now > this.props.expirationDate;
  }
}

Otp satisfies DomainFactory<OtpCreateProps, Otp>;

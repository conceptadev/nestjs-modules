import { randomUUID } from 'crypto';

import { AggregateRoot } from '@nestjs/cqrs';

import {
  DomainFactory,
  DomainMappable,
  EntityHeaderInterface,
  EventContextHost,
  OtpInterface,
} from '@concepta/nestjs-common';

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

export class Otp
  extends AggregateRoot
  implements OtpInterface, DomainMappable<OtpInterface>
{
  private props: OtpInterface;

  constructor(entity: OtpInterface) {
    super();
    this.props = { ...entity };
  }

  get id() {
    return this.props.id;
  }

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

  get dateCreated() {
    return this.props.dateCreated;
  }

  get dateUpdated() {
    return this.props.dateUpdated;
  }

  get dateDeleted() {
    return this.props.dateDeleted;
  }

  get version() {
    return this.props.version;
  }

  static create(
    eventContext: EventContextHost<EntityHeaderInterface>,
    props: OtpCreateProps,
  ): Otp {
    return Otp.createWithId(eventContext, randomUUID(), props);
  }

  static createWithId(
    eventContext: EventContextHost<EntityHeaderInterface>,
    id: string,
    props: OtpCreateProps,
  ): Otp {
    const { category, type, assigneeId, passcode, expiresIn } = props;
    const now = new Date();

    const otp = new Otp({
      id,
      category,
      type,
      assigneeId,
      passcode,
      expirationDate: getExpirationDate(expiresIn, now),
      active: true,
      dateCreated: now,
      dateUpdated: now,
      dateDeleted: null,
      version: 1,
    });

    otp.apply(new OtpCreatedEvent(eventContext, otp.toPlain()));

    return otp;
  }

  static toInstance(entity: OtpInterface): Otp {
    return new Otp(entity);
  }

  toPlain(): OtpInterface {
    return { ...this.props };
  }

  hydrate(entity: OtpInterface): void {
    this.props = { ...entity };
  }

  deactivate(eventContext: EventContextHost<EntityHeaderInterface>): void {
    this.props = {
      ...this.props,
      active: false,
      dateUpdated: new Date(),
      version: this.props.version + 1,
    };
    this.apply(new OtpDeactivatedEvent(eventContext, this.toPlain()));
  }

  consume(eventContext: EventContextHost<EntityHeaderInterface>): void {
    this.apply(new OtpConsumedEvent(eventContext, this.toPlain()));
  }

  isExpired(now: Date = new Date()): boolean {
    return now > this.props.expirationDate;
  }
}

Otp satisfies DomainFactory<OtpInterface, OtpCreateProps, Otp>;

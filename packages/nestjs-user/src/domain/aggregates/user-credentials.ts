import { randomUUID } from 'crypto';

import { AggregateRoot } from '@nestjs/cqrs';

import {
  type DomainFactory,
  DomainMappable,
  EventContextHost,
  UserCredentialCreatableInterface,
  UserCredentialEntityInterface,
} from '@concepta/nestjs-common';

import { UserCredentialsCreatedEvent } from '../events/user-credentials-created.event';
import { UserCredentialsDeactivatedEvent } from '../events/user-credentials-deactivated.event';

export class UserCredentials
  extends AggregateRoot
  implements
    UserCredentialEntityInterface,
    DomainMappable<UserCredentialEntityInterface>
{
  private props: UserCredentialEntityInterface;

  constructor(entity: UserCredentialEntityInterface) {
    super();
    this.props = { ...entity };
  }

  get id() {
    return this.props.id;
  }

  get userId() {
    return this.props.userId;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  get passwordSalt() {
    return this.props.passwordSalt;
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

  get validFrom() {
    return this.props.validFrom;
  }

  get validTo() {
    return this.props.validTo;
  }

  get version() {
    return this.props.version;
  }

  private toEventPayload() {
    const { passwordHash: _ph, passwordSalt: _ps, ...payload } = this.props;
    return payload;
  }

  static create(
    eventContext: EventContextHost,
    props: UserCredentialCreatableInterface,
  ): UserCredentials {
    return UserCredentials.createWithId(eventContext, randomUUID(), props);
  }

  static createWithId(
    eventContext: EventContextHost,
    id: string,
    props: UserCredentialCreatableInterface,
  ): UserCredentials {
    const now = new Date();

    const credentials = new UserCredentials({
      id,
      userId: props.userId,
      passwordHash: props.passwordHash,
      passwordSalt: props.passwordSalt,
      active: true,
      validFrom: now,
      validTo: null,
      dateCreated: now,
      dateUpdated: now,
      dateDeleted: null,
      version: 1,
    });

    credentials.apply(
      new UserCredentialsCreatedEvent(
        eventContext,
        credentials.toEventPayload(),
      ),
    );

    return credentials;
  }

  static toInstance(entity: UserCredentialEntityInterface): UserCredentials {
    return new UserCredentials(entity);
  }

  toPlain(): UserCredentialEntityInterface {
    return { ...this.props };
  }

  hydrate(entity: UserCredentialEntityInterface): void {
    this.props = { ...entity };
  }

  deactivate(eventContext: EventContextHost): void {
    const now = new Date();

    this.props = {
      ...this.props,
      active: false,
      validTo: now,
      dateUpdated: now,
      version: this.props.version + 1,
    };

    this.apply(
      new UserCredentialsDeactivatedEvent(eventContext, this.toEventPayload()),
    );
  }
}

UserCredentials satisfies DomainFactory<
  UserCredentialEntityInterface,
  UserCredentialCreatableInterface,
  UserCredentials
>;

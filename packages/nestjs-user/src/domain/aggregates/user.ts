import { randomUUID } from 'crypto';

import { AggregateRoot } from '@nestjs/cqrs';

import {
  type DomainFactory,
  DomainMappable,
  EventContextHost,
  UserCreatableInterface,
  UserEntityInterface,
  UserUpdatableInterface,
} from '@concepta/nestjs-common';

import { UserCreatedEvent } from '../events/user-created.event';
import { UserRemovedEvent } from '../events/user-removed.event';
import { UserUpdatedEvent } from '../events/user-updated.event';

export class User
  extends AggregateRoot
  implements UserEntityInterface, DomainMappable<UserEntityInterface>
{
  private props: UserEntityInterface;

  constructor(entity: UserEntityInterface) {
    super();
    this.props = { ...entity };
  }

  get id() {
    return this.props.id;
  }

  get email() {
    return this.props.email;
  }

  get username() {
    return this.props.username;
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
    eventContext: EventContextHost,
    props: UserCreatableInterface,
  ): User {
    return User.createWithId(eventContext, randomUUID(), props);
  }

  static createWithId(
    eventContext: EventContextHost,
    id: string,
    props: UserCreatableInterface,
  ): User {
    const now = new Date();

    const user = new User({
      id,
      email: props.email,
      username: props.username,
      active: props.active ?? true,
      dateCreated: now,
      dateUpdated: now,
      dateDeleted: null,
      version: 1,
    });

    user.apply(new UserCreatedEvent(eventContext, user.toPlain()));

    return user;
  }

  static toInstance(entity: UserEntityInterface): User {
    return new User(entity);
  }

  toPlain(): UserEntityInterface {
    return { ...this.props };
  }

  hydrate(entity: UserEntityInterface): void {
    this.props = { ...entity };
  }

  update(
    eventContext: EventContextHost,
    dto: Partial<UserUpdatableInterface>,
  ): void {
    this.props = {
      ...this.props,
      ...dto,
      dateUpdated: new Date(),
      version: this.props.version + 1,
    };
    this.apply(new UserUpdatedEvent(eventContext, this.toPlain()));
  }

  remove(eventContext: EventContextHost): void {
    this.apply(new UserRemovedEvent(eventContext, this.toPlain()));
  }
}

User satisfies DomainFactory<UserEntityInterface, UserCreatableInterface, User>;
